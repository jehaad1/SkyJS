import { Ref } from "./Ref.js";

function While(condition, callback, delay) {
    if (typeof condition !== "function") {
        throw Error("Condition is not a function");
    };
    if (typeof callback !== "function") {
        throw Error("Callback is not a function");
    };
    let [ref, onRef] = Ref();
    let refId = ref();
    let doc = "";
    let parent;
    onRef((element) => {
        parent = element.parentElement;
        if(typeof delay !== "number" || delay < 0) parent.innerHTML = doc;
        Refs.delete(refId);
    });
    if (typeof delay === "number" && delay > 0) {
        let Loop = setInterval(() => {
            if(!condition()) return clearInterval(Loop);
            doc += callback();
            parent.innerHTML = doc;
        }, delay);
    } else while (condition()) {
            doc += callback();
        };
    return `<holder ref="${ref()}"></holder>`;
};
