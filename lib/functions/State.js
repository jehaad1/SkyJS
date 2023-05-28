const States = new Map();

function State(initialValue) {
    let stateValue = initialValue;
    let stateId = `SkyState-${Date.now() * Math.floor(Math.random() * 10000000)}`;
    States.set(stateId, stateValue);

    function updateState(value) {
        stateValue = typeof value === "function" ? value(stateValue) : value;
        if (Functions.has(stateId)) Functions.get(stateId)(stateValue);
        States.set(stateId, stateValue);

        /* Conditional Rendering */
        [...Conditions.values()].forEach((Part) => {
            if (!(Part[0] instanceof HTMLElement)) return;
            let Replaces = Part[1]();
            if (Replaces === Part[0].textContent) return;
            Part[0].innerHTML = Replaces;
        });

        /* Reactive Parts */
        [...Parts.values()].forEach((Part) => {
            if (!Part[1].includes(stateId)) return;
            let Replaces = Part[1].replaceAll(stateId, stateValue);
            if (Part[0].nodeType === 2) {
                Part[1].match(/SkyState\-\d+/g).forEach((match) => {
                    Replaces = Replaces.replaceAll(match, States.get(match));
                });
                Part[0].value = Replaces;
                return;
            };
            Part[1].match(/SkyState\-\d+/g).forEach((match) => {
                Replaces = Replaces.replaceAll(match, States.get(match));
            });

            Part[0].textContent = Replaces;
        });

        /* List Rendering */
        if (stateValue instanceof Array) [...Lists.values()].forEach((List) => {
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
    return [(id) => id?.toLowerCase().trim() === "id" ? stateId : stateValue, updateState, onStateUpdate];
};

export { State, States };
