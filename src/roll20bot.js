function main(){
const Discord = require(`discord.js`);
const { prefix, clientOptions, activity, clientStatus } = require(`${process.cwd()}/components/config.json`);
const { token } =  require(`${process.cwd()}/components/token.json`);

const PageUnsupportedError = require(`${process.cwd()}/util/errors/PageUnsupportedError.js`);
const addTimestampLogs = require(`${process.cwd()}/util/general/addTimestampLogs.js`);
const selfDeleteReply = require(`${process.cwd()}/util/reply/selfDeleteReply.js`);
const cleanReply = require(`${process.cwd()}/util/reply/cleanReply.js`);
const embedEntry = require(`${process.cwd()}/features/embedEntry.js`);
const client = new Discord.Client(clientOptions);

const compendiumRegex = /https:\/\/roll20.net\/compendium\/dnd5e\//;
const escapeRegex = /^<.*>$/;

client.once('ready', async () => 
{
	addTimestampLogs();
	client.user.setPresence({activity:activity, status: clientStatus.status});
	console.log(`${client.user.username} has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds`);
});

client.on("message", async message => 
{
	if(!compendiumRegex.test(message.content)) return;
	const args = message.content.split(' ').map(arg => arg.split('\n')).flat();
	const urlsNotDeduped = args.filter(arg => compendiumRegex.test(arg) && !escapeRegex.test(arg)).map(url => url.startsWith('<') ? url.slice(1) : url);
	if(urlsNotDeduped == false) return;
	const urls = [];
	urlsNotDeduped.forEach(url => !urls.includes(url) && urls.push(url));
	for(let i = 0; i < (urls.length < 5 ? urls.length : 4); i++)
	{
		try {
			const embed = await embedEntry(urls[i]);
			await message.channel.send(embed);
		} catch(e) {
			if(!(e instanceof PageUnsupportedError)) console.error(e.stack); //don't log for unsupported pages, it's not a real error
			urls.splice(i,1);
			i--;
		}
	}
	if(urls.length == 0) return;
	try {
		await message.suppressEmbeds();
	} catch(e) {
		console.error(e.stack);
	}
});

client.login(token);
}

main();