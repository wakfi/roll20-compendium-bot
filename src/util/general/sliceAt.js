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
 * @returns {InstanceType<StringConstructor> & {sliceAt: (search: string, after=: boolean) => ReturnType<typeof sliceAtPipeline>}}
 */
function sliceAtPipeline(source) {
  const sliceFn = (search, after) =>
    sliceAtPipeline(sliceAt(source, search, after));
  const sliceable = new String(source);
  Object.defineProperty(sliceable, "sliceAt", {
    value: sliceFn,
    writable: true,
    enumerable: false,
    configurable: true,
  });
  return sliceable;
}

module.exports = {
  sliceAt,
  sliceAtPipeline,
};
