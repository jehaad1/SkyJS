import { EventHandlers } from "./EventHandler.js";
import { Refs } from "./Ref.js";
import { States } from "./State.js";

const Parts = new Set();

function Document(htmlString, parentElement) {
    if (htmlString instanceof Array) htmlString = htmlString[0];
    if (typeof htmlString !== "string") throw new Error("Invalid HTML string");
    const Parser = new DOMParser();
    const doc = Parser.parseFromString(htmlString.replaceAll(/\<\#(\s+[^>]*?)?>/g, "<SkyWraper$1>").replaceAll("</#>", "</SkyWraper>"), "text/html");
    let root = [...doc.documentElement.querySelector("body").children].length === 1 ? [doc.documentElement.querySelector("body").children[0], ...doc.documentElement.querySelector("body").children[0].children] : null;
    if (root === null) throw Error("Document elements must be grouped by a wrapper element or use \"<#></#>\"");
    let children = allChildren({ children: root });
    let newRoot = doc.documentElement.querySelector("body").children[0];
    if(parentElement) {
        if(typeof parentElement === "string" && document.querySelector(parentElement) instanceof HTMLElement) {
            Render(children);
            document.querySelector(parentElement).appendChild(newRoot);
        };
        if(parentElement instanceof HTMLElement) {
            Render(children);
            parentElement.appendChild(newRoot);
        };
        if(parentElement instanceof HTMLCollection) {
            [...parentElement].forEach((element) => {
                let root = newRoot.cloneNode(true);
                let children = allChildren({ children: [root, ...root.children]});
                Render(children);
                element.appendChild(root);
            });
        };
        if(parentElement instanceof NodeList) {
            [...parentElement].forEach((element) => {
            let root = newRoot.cloneNode(true);
            let children = allChildren({ children: [root, ...root.children]});
            Render(children);
            element.appendChild(root);
        });
    };
    } else Render(children);
    if (newRoot === null) throw Error("Document elements must be grouped by a wrapper element or use \"<#></#>\"")
    return newRoot;
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
            if (node.nodeType === 3 && node.textContent.match(/Sky(List)?State\-\d+/g)) {
                Parts.add([node, node.textContent.replaceAll("SkyListState-", "SkyState-")]);
                if (node.textContent.match(/Sky(List)?State\-\d+/g)) node.textContent.match(/Sky(List)?State\-\d+/g).forEach((match) => {
                    node.textContent = node.textContent.replaceAll(match, States.get(match.replaceAll("SkyListState", "SkyState")));
                });
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
                if (attr.value.match(/SkyState\-\d+/g)) {
                    Parts.add([attr, attr.value]);
                    if (attr.value.match(/SkyState\-\d+/g)) attr.value.match(/SkyState\-\d+/g).forEach((match) => {
                        attr.value = attr.value.replaceAll(match, States.get(match));
                    });
                };
            }
        });
    };
};

export { Document, Parts };
