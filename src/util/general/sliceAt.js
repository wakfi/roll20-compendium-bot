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

/**
 *
 * @returns {string & {sliceAt: (search: string, after=: boolean) => ReturnType<typeof sliceAtPipeline>}}
 */
function sliceAtPipeline(source) {
  const sliceFn = (search, after) =>
    sliceAtPipeline(sliceAt(source, search, after));
  const sliceable = String(source);
  sliceable.sliceAt = sliceFn;
  return sliceable;
}

module.exports = {
  sliceAt,
  sliceAtPipeline,
};
