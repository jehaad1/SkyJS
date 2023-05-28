const Refs = new Map();

function Ref() {
  let refId = `SkyRef-${Date.now() * Math.floor(Math.random() * 10000000)}`;
  Refs.set(refId, [null]);

  function onReference(func) {
    if (typeof func !== "function")
      throw new Error("The argument passed must be a function");
    Refs.set(refId, [null, func]);
  }
  return [() => Refs.get(refId)[0] || refId, onReference];
}

export { Ref, Refs };
