const fetch = require(`node-fetch`);
const rp = async (query) => await(await fetch(query)).text();
const {MessageEmbed} = require(`${process.cwd()}/util/discord/structs.js`);
const { supportedPages, supportedSubpages } = require(`${process.cwd()}/components/config.json`);
const PageUnsupportedError = require(`${process.cwd()}/util/errors/PageUnsupportedError.js`);

function embedEntry(url)
{
	return new Promise(async (resolve,reject) =>
	{
		try {
			const response = await rp(url);
			if(!response) return;
			const subpage = supportedSubpages.find(subpage => url.includes(subpage));
			const type = subpage || response.split(`Index%3A`)[1].split(`"`)[0];
			if(!(subpage || supportedPages.includes(type)))
			{
				reject(new PageUnsupportedError(`cannot generate embed: unsupported type "${type}"`));
				return;
			}
			const {n:name, c:attributes} = JSON.parse(response.split(`3e\\n","attributes":`)[1].split(`};`)[0].replace(/"—"/g, `""`));
			
			for(let prop in attributes) 
			{
				if (Object.prototype.hasOwnProperty.call(attributes, prop))
				{
					if(prop !== prop.toLowerCase())
					{
						attributes[prop.toLowerCase()] = attributes[prop];
						delete attributes[prop];
						prop = prop.toLowerCase();
					} else {
						const tmp = attributes[prop];
						delete attributes[prop];
						attributes[prop] = tmp;
					}
					if(/ /.test(prop))
					{
						const tmp = attributes[prop];
						delete attributes[prop];
						prop = prop.replace(/ /g, '_');
						attributes[prop] = tmp;
					}
				}
			}
			
			switch(type)
			{
				case 'Spells':
					resolve(spell(name,attributes,url));
				case 'Items':
					resolve(item(name,attributes,url,response));
				default:
					reject(new TypeError(`cannot generate embed: unknown type "${type}"`));
			}
		} catch(e) {
			reject(e);
		}
	});
}

function spell(name,attributes,url)
{
	const embed = new MessageEmbed()
		.setAuthor(attributes.level ? `${attributes.level}${numberSuffix(attributes.level)} level ${attributes.school}` : `Cantrip ${attributes.school}`)
		.setTitle(name)
		.setDescription((attributes['data-description'].replace(/<br \/>/g, '\n') + `\n**At Higher Levels:**` + attributes.higher_spell_slot_desc).replace(/<br>/g, '\n').trim())
		.addField('Casting Time', attributes.casting_time)
		.addField('Range', attributes.range)
		.addField('Components', attributes.components)
		.addField('Duration', attributes.duration)
		.addField('Classes', attributes.classes)
		.setColor(0xd3a134)
		.setURL(url);
	if(attributes.ritual) embed.setFooter('Ritual');
	return embed;
}

function item(name,attributes,url,response)
{
	attributes['data-description'] = response.split(`origpagecontent">`)[1].split(`</script>`)[0].trim();
	
	const itemTypeArr = [attributes.item_type];
	if(attributes.subtype) itemTypeArr.push(`(${attributes.subtype})`);
	
	const embed = new MessageEmbed()
		.setAuthor(itemTypeArr.join(' '))
		.setTitle(name)
		.setDescription(attributes['data-description'].replace(/<br \/>/g, '\n').replace(/<br>/g, '\n').trim())
		.setColor(0xd3a134)
		.setURL(url);
		if(attributes.ac) embed.addField('AC', attributes.ac)
		if(attributes.category) embed.addField('Category', attributes.category)
		if(attributes.damage) embed.addField('Damage', attributes.damage)
		if(attributes.damage_type) embed.addField('Damage Type', attributes.damage_type)
		if(attributes.duration) embed.addField('duration', attributes.duration)
		if(attributes.item_rarity) embed.addField('Item Rarity', attributes.item_rarity)
		if(attributes.modifiers) embed.addField('Modifiers', attributes.modifiers)
		if(attributes.properties) embed.addField('Properties', attributes.properties)
		if(attributes.range) embed.addField('Range', attributes.range)
		if(attributes.requires_attunement) embed.addField('Requires Attunement', attributes.requires_attunement)
		if(attributes.save) embed.addField('Save', attributes.save)
		if(attributes.secondary_damage) embed.addField('Secondary Damage', attributes.secondary_damage)
		if(attributes.stealth) embed.addField('Stealth', attributes.stealth)
		if(attributes.target) embed.addField('Target', attributes.target)
		if(attributes.weight) embed.addField('Weight', attributes.weight)
	return embed;
}
	
function numberSuffix(number)
{
	number = `${number}`;
	switch(number)
	{
		case '1':
			return 'st';
		case '2':
			return 'nd';
		case '3':
			return 'rd';
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
			return 'th';
		default:
			return '';
	}
}

module.exports = embedEntry;