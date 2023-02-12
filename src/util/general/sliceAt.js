function sliceAt(source, search, after = false) {
  const index = source.indexOf(search);
  if (index === -1) {
    return;
  }
  if (after) {
    return source.slice(index + search.length);
  } else {
    return source.slice(0, index);
  }
}

module.exports = sliceAt;
