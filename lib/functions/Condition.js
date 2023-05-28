import { Ref, Refs } from "./Ref.js";

const Conditions = new Set();

function Condition(callback) {
  if (typeof callback !== "function")
    throw new Error("The argument passed must be a function");
  let [ref, onRef] = Ref();
  let refId = ref();
  let condition = callback();
  onRef((element) => {
    let parent = element.parentElement;
    parent.innerHTML = condition ?? "";
    Conditions.add([parent, callback]);
    Refs.delete(refId);
  });
  return `<holder ref="${ref()}"></holder>`;
}

export { Condition, Conditions };
