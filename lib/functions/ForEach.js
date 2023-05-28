import { States } from "./State.js";
import { Ref } from "./Ref.js";

const Lists = new Set();

function ForEach(list, callback) {
    let listId = null;
    if (typeof list === "string" && (list.match(/SkyState\-\d+/g)[0] && list === list.match(/SkyState\-\d+/g)[0])) {
        listId = list.match(/SkyState\-\d+/g)[0];
        list = States.get(listId);
    };
    if (!(list instanceof Array)) {
        // Maybe adding Object
        throw Error("List is not an array");
    };
    if (typeof callback !== "function") {
        throw Error("Callback is not a function");
    };
    let [ref, onRef] = Ref();
    let refId = ref();
    let doc = "";
    onRef((element) => {
        let parent = element.parentElement;
        parent.innerHTML = doc;
        if (listId) Lists.add([parent, listId, callback]);
        else {
            Render(allChildren(parent));
        };
        Refs.delete(refId);
    });
    list.forEach((ele) => doc += callback(ele));
    return `<holder ref="${ref()}"></holder>`;
};

export { ForEach, Lists };
