let Elements = [],
    Memories = [],
    Components = {},
    Comebacks = {},
    UsedComebacks = {},
    Displays = new Map(),
    Functions = {};

/* Render The Page Once It Load */

window.onload = () => {
    SkyRenderPage();
    SkyRenderMemories();
};

/* Single Memory */

function SkyMemory(initialValue) {
    if (!initialValue || typeof initialValue !== "object") throw new Error("SkyMemory: parameter 1 is not an object.");
    let memoryValue = Object.values(initialValue)[0];
    Memories.push([Object.keys(initialValue)[0], memoryValue]);

    function updateMemory(value) {
        memoryValue = typeof value === "function" ? value(memoryValue) : value;
        if (Functions[Object.keys(initialValue)[0]]) Functions[Object.keys(initialValue)[0]](memoryValue);
        Memories = Memories.map(Memory => {
            if (Memory[0] === Object.keys(initialValue)[0]) return [Object.keys(initialValue)[0], memoryValue];
            return Memory;
        });
        SkyRenderMemories();
    };

    function onUpdateMemory(func) {
        if (typeof func !== "function") throw new Error("OnUpdateMemory: parameter 2 is not a function.");
        else Functions[Object.keys(initialValue)[0]] = func;
    };

    return [memoryValue, onUpdateMemory, updateMemory];
};

function SkyHTMLMemory(initialValue) {
    if (!initialValue || typeof initialValue !== "object") throw new Error("SkyMemory: parameter 1 is not an object");
    let memoryValue = Object.values(initialValue)[0];
    Memories.push([Object.keys(initialValue)[0], memoryValue, "HTML"]);

    function updateMemory(value) {
        memoryValue = typeof value === "function" ? value(memoryValue) : value;
        if (Functions[Object.keys(initialValue)[0]]) Functions[Object.keys(initialValue)[0]](memoryValue);
        Memories = Memories.map(Memory => {
            if (Memory[0] === Object.keys(initialValue)[0]) return [Object.keys(initialValue)[0], memoryValue];
            return Memory;
        });
        SkyRenderMemories();
    };

    function onUpdateMemory(func) {
        if (typeof func !== "function") throw new Error("OnUpdateMemory: parameter 2 is not a function.");
        else Functions[Object.keys(initialValue)[0]] = func;
    };

    return [memoryValue, onUpdateMemory, updateMemory];
};

function SkyComponent(componentObject) {
    if (!componentObject || typeof componentObject !== "object") throw new Error("SkyComponent: parameter 1 is not an object.");
    if (!componentObject.component || typeof componentObject.component !== "function") throw new Error("SkyComponent: component is not a function.");
    if(componentObject.props && typeof componentObject.props !== "object") throw new Error("SkyComponent: props is not an object.");
    let mountElement = typeof componentObject.mountElement === "string" ? document.querySelector(componentObject.mountElement) : componentObject.mountElement;
    const component = componentObject.component(mountElement, componentObject.props);
    if(typeof component !== "string") throw new Error("SkyComponent: component is not a string.");
    if(component[0] !== "<" || component[component.length - 1] !== ">") throw new Error("SkyComponent: component is not a valid HTML element.");
    let componentElement = document.createElement(component.slice(1).split(" ")[0]);
    componentElement.innerHTML = component.split(">").slice(1).join(">").split("<").slice(0, -1).join("<");
    component.split(">")[0].split(" ").slice(1).forEach(attr => {
        attr.includes("=") ? componentElement.setAttribute(attr.split("=")[0], attr.split("=")[1].split("\"").slice(1, -1).join("\"")) : componentElement.setAttribute(attr, "");
    });
    mountElement.parentElement.replaceChild(componentElement, mountElement);

    function reMountComponent() {
        let newComponentElement = componentElement;
        componentElement = document.createElement(component.slice(1).split(" ")[0]);
        componentElement.innerHTML = component.split(">").slice(1).join(">").split("<").slice(0, -1).join("<");
        component.split(">")[0].split(" ").slice(1).forEach(attr => {
            attr.includes("=") ? componentElement.setAttribute(attr.split("=")[0], attr.split("=")[1].split("\"").slice(1, -1).join("\"")) : componentElement.setAttribute(attr, "");
        });
        newComponentElement?.parentElement?.replaceChild(componentElement, newComponentElement);
        componentElement.innerHTML = component.split(">").slice(1).join(">").split("<").slice(0, -1).join("<");
    };

    function unMountComponent() {
        componentElement.remove();
    };

    return [() => componentElement, reMountComponent, unMountComponent];
};

function SkyComeback(Comeback) {
    if (!Comeback || typeof Comeback !== "object") throw new Error();
    if (typeof Object.values(Comeback)[0] !== "function") throw new Error();
    Comebacks[Object.keys(Comeback)[0].toLowerCase()] = Object.values(Comeback)[0];
};

function SkyRenderMemories() {
    Elements.forEach(Element => {
        let Elemented = Element.Content;
        Memories.forEach(Memory => {
            if (!Array.isArray(Memory) || !new RegExp(`\\(\\(${Memory[0]}[\\S\\s]*\\)\\)`, 'gi').test(Elemented)) return;
            let Memorize = undefined;
            if (typeof Memory[1] === "string") Memorize = Memory[1].match(/<[^>]*>/g);
            let CurrentMemory = Memory[1];
            if (Memorize && Memorize.length) Memorize = Memorize.map(function(ReplaceMemory) {
                if (ReplaceMemory === "</>") return [ReplaceMemory, "&lt;/&gt;"];
                return [ReplaceMemory, ReplaceMemory.replaceAll("<", "&lt;").replaceAll(">", "&gt;")];
            });
            if (!Memory[2] && Memorize) Memorize.forEach((ReplaceMemory) => {
                Memory[1] = Memory[1].replaceAll(ReplaceMemory[0], ReplaceMemory[1]);
            });
            let ValueRegex = new RegExp(`\\(\\(${Memory[0]}[\\S\\s]*\\)\\)`, 'gi');
            if (Element.Content.match(ValueRegex)) Element.Content.match(ValueRegex)[0].split(" ").forEach(Value => {
                Elemented = Elemented.replaceAll(Value, new Function(Memory[0], `return ${Value}`)(Memory[1]));
                Element.Element.innerHTML = Elemented;
                Memory[1] = CurrentMemory;
            });
        });
        Element.Attributes.forEach(Attr => {
            let attr = Attr[1].name,
                value = Attr[1].value,
                lastAttr = attr,
                firstChange = true;

            Memories.forEach(Memory => {
                try {
                    let ValueRegex = new RegExp(`\\(\\(${Memory[0]}[\\S\\s]*\\)\\)`, 'gi');
                    if (attr.match(ValueRegex)) attr.match(ValueRegex)[0].split(" ").forEach(Value => {
                        if (!Memory[2]) attr = attr.replaceAll(Value, new Function(Memory[0], `return ${Value}`)(Memory[1]));
                        else attr = attr.replaceAll(Value, "");
                        value = value.replaceAll(Value, new Function(Memory[0], `return ${Value}`)(Memory[1]));

                        if (Memory[3]) firstChange = false;
                        if (Memory[3] && !Memory[2]) lastAttr = lastAttr.replaceAll(Value, new Function(Memory[0], `return ${Value}`)(Memory[3]));
                        else if (Memory[3] && Memory[2]) lastAttr = lastAttr.replaceAll(Value, "");
                        else if (!Memory[3] && !Memory[2]) lastAttr = lastAttr.replaceAll(Value, new Function(Memory[0], `return ${Value}`)(Memory[1]));
                        else lastAttr = lastAttr.replaceAll(Value, "");
                    });
                    if (!attr.match(ValueRegex) && value.match(ValueRegex)) value.match(ValueRegex)[0].split(" ").forEach(Value => {
                        value = value.replaceAll(Value, new Function(Memory[0], `return ${Value}`)(Memory[1]));
                    });
                } catch {};
            });

            if (firstChange) Element.Element.setAttribute(attr, value);
            else if (Element.Element.hasAttribute(lastAttr)) Element.Element.setAttribute(attr, value);
            else Element.Attributes = Element.Attributes.filter(Attribute => Attribute !== Attr);

            if (lastAttr !== Attr[1].name && lastAttr !== attr) Element.Element.removeAttribute(lastAttr);
        });
        Element["After"] = Element.Element.outerHTML;
    });
};

function SkyRenderPage() {

    Elements.forEach(Element => {
        if (!Element.Element || Element.Element.getAttribute("SkyElement") === null) Elements = Elements.filter(Ele => Ele !== Element);
        else {
            if (Element.After !== Element.Element.outerHTML) {
                Element.Content = Element.Element.innerHTML;
                SkyRenderMemories();
            };
        };
    });

    [...document.querySelectorAll(`[SkyElement]`)].forEach(Element => {
        let Exists = false;
        Elements.forEach(Elemented => {
            if (Element == Object.values(Elemented)[0]) return Exists = true;
        });
        if (!Exists) {
            Elements.push({
                Element,
                Content: Element.innerHTML,
                Attributes: Object.entries(Element.attributes).filter(Attr => /\(\([\s\S]*\)\)/i.test(Attr[1].name) || /\(\([\s\S]*\)\)/i.test(Attr[1].value))
            });
            Object.entries(Element.attributes).filter(Attr => /\(\([\s\S]*\)\)/i.test(Attr[1].name) || /\(\([\s\S]*\)\)/i.test(Attr[1].value)).forEach(Attr => Element.removeAttribute(Attr[1].name));
        } else {
            if (Object.entries(Element.attributes).filter(Attr => /\(\([\s\S]*\)\)/i.test(Attr[1].name) || /\(\([\s\S]*\)\)/i.test(Attr[1].value)).length > 0) {
                Elements.find(Ele => Ele.Element === Element).Attributes.push(...Object.entries(Element.attributes).filter(Attr => /\(\([\s\S]*\)\)/i.test(Attr[1].name) || /\(\([\s\S]*\)\)/i.test(Attr[1].value)));
            };
        };
    });

    Object.entries(Comebacks).forEach(Comeback => {
        [...document.querySelectorAll(`[${Comeback[0]}]`)].forEach(Element => {
            !Element.hasAttribute("Comeback-Id") ? Element.setAttribute("Comeback-Id", Math.floor(Math.random() * 99999999999999) + Date.now()) : false;
            if ([...Object.entries(UsedComebacks)].filter(Obj =>
                    Obj[0].startsWith(`${Comeback[0]}`) &&
                    Object.values(Obj[1])[0] === Element &&
                    Object.values(Obj[1])[1] === Element.innerHTML
                ).length > 0) return;
            if (UsedComebacks[`${Comeback[0]}-${Element.getAttribute("Comeback-Id")}`] && UsedComebacks[`${Comeback[0]}-${Element.getAttribute("Comeback-Id")}`]["UsesTimes"] === Comeback[1][1]) return;
            Comeback[1][0](Element.getAttribute(Comeback[0]), Element, Element.children);
            UsedComebacks[`${Comeback[0]}-${Element.getAttribute("Comeback-Id")}`] = {
                Element,
                innerHTML: Element.innerHTML,
                UsesTimes: UsedComebacks[`${Comeback[0]}-${Element.getAttribute("Comeback-Id")}`] ? UsedComebacks[`${Comeback[0]}-${Element.getAttribute("Comeback-Id")}`]["UsesTimes"] + 1 : 1
            };
        });
    });
};

function SkyAutoRender(Milliseconds = 10) {
    if (typeof Milliseconds !== "number") throw new Error("SkyAutoRender: parameter 1 is not a number.");
    setInterval(() => SkyRenderPage(), Milliseconds);
};

export {
    SkyRenderPage,
    SkyAutoRender,
    SkyMemory,
    SkyHTMLMemory,
    SkyComponent,
    SkyComeback
};