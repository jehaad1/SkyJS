const States = new Map();
const Refs = new Map();
const Functions = new Map();
const Merges = new Map();
const EventHandlers = new Map();
const Elements = new Set();
const Conditions = new Set();
const Lists = new Set();

const parser = new DOMParser();

function State(initialValue) {
    let stateValue = initialValue;
    let stateId = `({({SkyState-${Date.now() * Math.floor(Math.random() * 10000000)}})})`;
    States.set(stateId, stateValue);

    function updateState(value) {
        if (!value) return;
        if (typeof value !== "function") throw new Error("The updateState method must have a function to update the state");
        stateValue = value(stateValue);
        if (Functions.has(stateId)) Functions.get(stateId)(stateValue);
        States.set(stateId, stateValue);
        Merges.forEach((Merge, MergeId) => {
            if (!(Merge[1] instanceof Array) || !Merge[1].includes(stateId)) return;
            if (Merge[0].nodeType === 2) return Merge[0].value = Merge[3].replaceAll(MergeId, Merge[2](Merge[1].map((state) => state === stateId ? stateValue : States.get(state))));
            Merge[0].textContent = Merge[3].replaceAll(MergeId, Merge[2](Merge[1].map((state) => States.has(state) ? States.get(state) : state)));
        });
        [...Conditions.values()].forEach((Element) => {
            if (Element[2](Element[1].map((state) => States.has(state) ? States.get(state) : state)))
                if (!(Element[1] instanceof Array) || !Element[1].includes(stateId)) return;
            let Replaces = Element[2](Element[1].map((state) => States.has(state) ? States.get(state) : state));
            if (!Replaces) return Element[0].innerHTML = "";
            if (Replaces.match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g)) Replaces.match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g).forEach((match) => {
                Replaces = Replaces.replaceAll(match, States.get(match));
            });
            const doc = parser.parseFromString(Replaces.replaceAll("<#>", "<SkyWraper>").replaceAll("</#>", "</SkyWraper>"), "text/html");
            let root = [...doc.documentElement.querySelector("body").children].length === 1 ? [doc.documentElement.querySelector("body").children[0], ...doc.documentElement.querySelector("body").children[0].children] : [...doc.documentElement.querySelector("body").children];
            if (root.length === 0) return "";
            let elements = allChildren({ children: root });
            Render(elements);
            Element[0].innerHTML = "";
            [...doc.documentElement.querySelector("body").children].forEach((element) => Element[0].appendChild(element));
        });
        [...Elements.values()].forEach((Element) => {
            if (!Element[1].includes(stateId)) return;
            let Replaces = Element[1].replaceAll(stateId, stateValue);
            if (Element[0].nodeType === 2) {
                Element[1].match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g).forEach((match) => {
                    Replaces = Replaces.replaceAll(match, States.get(match));
                });
                if (Element[1].match(/\(\{\(\{SkyMerge-\d+\}\)\}\)/g)) Element[1].match(/\(\{\(\{SkyMerge-\d+\}\)\}\)/g).forEach((match) => {
                    Merges.forEach((Merge, MergeId) => {
                        if (MergeId !== match) return;
                        Replaces = Replaces.replaceAll(MergeId, Merge[2](Merge[1].map((state) => States.has(state) ? States.get(state) : state)));
                    });
                });
                Element[0].value = Replaces;
                return;
            };
            Element[1].match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g).forEach((match) => {
                Replaces = Replaces.replaceAll(match, States.get(match));
            });
            if (Element[1].match(/\(\{\(\{SkyMerge-\d+\}\)\}\)/g)) Element[1].match(/\(\{\(\{SkyMerge-\d+\}\)\}\)/g).forEach((match) => {
                Merges.forEach((Merge, MergeId) => {
                    if (MergeId !== match) return;
                    Replaces = Replaces.replaceAll(MergeId, Merge[2](Merge[1].map((state) => States.has(state) ? States.get(state) : state)));
                });
            });
            Element[0].textContent = Replaces;
        });
        if (stateValue instanceof Array)[...Lists.values()].forEach((List) => {
            if (!(List instanceof Array) || List[1] !== stateId) return;
            [...List[0].children].forEach(child => child.remove())
            let doc = "";
            stateValue.forEach((ele) => doc += List[2](ele));
            List[0].innerHTML = doc;
        });
    };

    function onStateUpdate(func) {
        if (typeof func !== "function") return;
        Functions.set(stateId, func);
    };
    return [() => stateId, updateState, onStateUpdate];
};

function Ref() {
    let refId = `({({SkyRef-${Date.now() * Math.floor(Math.random() * 10000000)}})})`;
    Refs.set(refId, [null]);

    function onReference(func) {
        if (typeof func !== "function") return;
        Refs.set(refId, [null, func]);
    }
    return [() => Refs.get(refId)[0] || refId, onReference]
}

function Document(htmlString) {
    if (htmlString instanceof Array) htmlString = htmlString[0];
    if (typeof htmlString !== "string") throw new Error("Invalid HTML string");
    const doc = parser.parseFromString(htmlString.replaceAll(/\<\#(\s+[^>]*?)?>/g, "<SkyWraper$1>").replaceAll("</#>", "</SkyWraper>"), "text/html");
    let root = [...doc.documentElement.querySelector("body").children].length === 1 ? [doc.documentElement.querySelector("body").children[0], ...doc.documentElement.querySelector("body").children[0].children] : [...doc.documentElement.querySelector("body").children];
    if (root.length === 0) return "";
    let elements = allChildren({ children: root });
    Render(elements);
    if ([...doc.documentElement.querySelector("body").children].length !== 1) console.error("Document elements must be grouped by a wrapper element or use \"<#></#>\"")
    return [...doc.documentElement.querySelector("body").children].length === 1 ? doc.documentElement.querySelector("body").children[0] : "";
};

function allChildren(element) {
    let elements = [...element.children];
    for (let i = 0; i < element.children.length; i++) {
        if (element.children[i].children) elements = [...elements, ...allChildren({ children: element.children[i].children })]
    };
    return elements;
};

function Render(elements) {
    for (let element of elements) {
        for (let node of element.childNodes) {
            if (node.nodeType === 3 && node.textContent.match(/\(\{\(\{Sky(List)?State\-\d+\}\)\}\)/g)) {
                Elements.add([node, node.textContent.replaceAll("({({SkyListState-", "({({SkyState-")]);
                if (node.textContent.match(/\(\{\(\{Sky(List)?State\-\d+\}\)\}\)/g)) node.textContent.match(/\(\{\(\{Sky(List)?State\-\d+\}\)\}\)/g).forEach((match) => {
                    node.textContent = node.textContent.replaceAll(match, States.get(match.replaceAll("SkyListState", "SkyState")));
                });
            };
            if (node.textContent.match(/\(\{\(\{SkyMerge\-\d+\}\)\}\)/g)) {
                if(node.textContent.match(/\(\{\(\{SkyMerge\-\d+\}\)\}\)/g).length > 1) {
                    node.textContent = node.textContent.replaceAll(/\(\{\(\{SkyMerge\-\d+\}\)\}\)/g, "");
                } else {
                    let match = node.textContent.match(/\(\{\(\{SkyMerge\-\d+\}\)\}\)/g)[0];
                    if (!Merges.has(match) || typeof Merges.get(match)[1] !== "function") return;
                    let Merge = Merges.get(match);
                    if (Merge.length === 4) Merge = [Merge[1], Merge[2]];
                    Merges.set(match, [node, ...Merge, node.textContent]);
                    node.textContent = node.textContent.replace(match, Merge[1](Merge[0].map((state) => States.has(state) ? States.get(state) : state)));
                };
            };
        };
    };
    for (let i = 0; i < elements.length; i++) {
        [...elements[i].attributes].forEach(attr => {
            if (attr.name === "ref") {
                if (!Refs.has(elements[i].getAttribute("ref"))) return;
                let func = Refs.get(elements[i].getAttribute("ref"))[1];
                Refs.set(elements[i].getAttribute("ref"), [elements[i]]);
                if (func) func(elements[i]);
                elements[i].removeAttribute("ref");
            } else if (attr.name.startsWith("on-") && attr.name.split("-")[1] !== "") {
                if (EventHandlers.has(attr.value)) {
                    elements[i].addEventListener(attr.name.split("-")[1].toLowerCase(), EventHandlers.get(attr.value));
                } else elements[i].addEventListener(attr.name.split("-")[1].toLowerCase(), new Function(`return ${attr.value}`)());
                elements[i].removeAttribute(attr.name);
            } else {
                if (attr.value.match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g)) {
                    Elements.add([attr, attr.value]);
                    if (attr.value.match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g)) attr.value.match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g).forEach((match) => {
                        attr.value = attr.value.replaceAll(match, States.get(match));
                    });
                };
                if (attr.value.match(/\(\{\(\{SkyMerge\-\d+\}\)\}\)/g)) {
                    attr.value.match(/\(\{\(\{SkyMerge\-\d+\}\)\}\)/g).forEach((match) => {
                        if (!Merges.has(match)) return;
                        let Merge = Merges.get(match);
                        if (Merge.length === 4) Merge = [Merge[1], Merge[2]];
                        Merges.set(match, [attr, ...Merge, attr.value]);
                        attr.value = attr.value.replaceAll(match, Merge[1](Merge[0].map((state) => States.has(state) ? States.get(state) : state)));
                    });
                };
            }
        });
    };
};

function ForList(list, callback) {
    let [ref, onRef] = Ref();
    let refId = ref();
    let listId = null;
    let doc = "";
    onRef((element) => {
        if (listId) Lists.add([element, listId, callback]);
        else {
            Render(allChildren(element));
        };
        Refs.delete(refId);
    });
    if (typeof list === "string" && (list.match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g)[0] && list === list.match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g)[0])) {
        listId = list.match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g)[0];
        list = States.get(listId);
    };
    if (!(list instanceof Array)) {
        // Maybe adding Object
        console.error("List is not an array");
        return "";
    };
    if (typeof callback !== "function") {
        console.error("Callback is not a function");
        return;
    };
    list.forEach((ele) => {
        if (typeof ele === "string" && ele.match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g)) {
            ele.match(/\(\{\(\{SkyState\-\d+\}\)\}\)/g).forEach((match) => {
                ele = ele.replaceAll(match, match.replaceAll("SkyState", "SkyListState"));
            });
        };
        doc += callback(ele);
    });
    return `<SkyList ref="${ref()}">${doc}</SkyList>`;
};

function Merge(states, callback) {
    if (typeof callback !== "function") return;
    if (!(states instanceof Array)) return;
    let mergeId = `({({SkyMerge-${Date.now() * Math.floor(Math.random() * 10000000)}})})`;
    Merges.set(mergeId, [states, callback]);
    return mergeId;
};

function Conditional(states, callback) {
    if (typeof callback !== "function") return;
    if (!(states instanceof Array)) return;
    let [ref, onRef] = Ref();
    let refId = ref();
    onRef((element) => {
        Conditions.add([element, states, callback]);
        Refs.delete(refId);
    });
    let condition = callback(states.map(state => States.has(state) ? States.get(state) : state));
    return `<SkyCondition ref="${ref()}">${condition ?? ""}</SkyCondition>`;
};

function EventHandler(callback) {
    let eventHandlerId = `({({SkyEventHandler-${Date.now() * Math.floor(Math.random() * 10000000)}})})`;
    EventHandlers.set(eventHandlerId, callback);
    return eventHandlerId;
}
