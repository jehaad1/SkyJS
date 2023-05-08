const States = new Map();
const Refs = new Map();
const Functions = new Map();
const Merges = new Map();
const EventHandlers = new Map();
const Elements = new Set();
const Conditions = new Set();
const Lists = new Set();
const parser = new DOMParser();

/**
 * @desc Creates a state object with initial value and returns an array of functions to update, get the id and set a callback for when the state is updated.
 * @param {any} initialValue - The initial value of the state.
 */
function State(initialValue) {
  let stateValue = initialValue;
  let stateId = `({({SkyState-${
    Date.now() * Math.floor(Math.random() * 10000000)
  }})})`;
  States.set(stateId, stateValue);

  function updateState(value) {
    validateValue(value);
    States.set(stateId, stateValue);
  }

  function validateValue(value) {
    const isNotFunction = typeof value !== "function";
    if (!value || isNotFunction)
      throw new Error(
        "The updateState method must have a function to update the state"
      );
    if (typeof value !== "function")
      throw new Error(
        "The updateState method must have a function to update the state"
      );
    stateValue = value(stateValue);
    if (Functions.has(stateId)) Functions.get(stateId)(stateValue);
    States.set(stateId, stateValue);
    Merges.forEach((Merge, MergeId) => {
      if (!(Merge[1] instanceof Array) || !Merge[1].includes(stateId)) return;
      if (Merge[0].nodeType === 2) {
        Merge[0].value = Merge[3].replaceAll(MergeId, Merge[2]());
        return;
      }
      Merge[0].textContent = Merge[3].replaceAll(
        MergeId,
        Merge[2](
          Merge[1].map((state) =>
            States.has(state) ? States.get(state) : state
          )
        )
      );
    });
    [...Conditions.values()].forEach((Element) => {
      if (
        Element[2](
          Element[1].map((state) =>
            States.has(state) ? States.get(state) : state
          )
        )
      )
        if (!(Element[1] instanceof Array) || !Element[1].includes(stateId))
          return;
      let Replaces = Element[2](
        Element[1].map((state) =>
          States.has(state) ? States.get(state) : state
        )
      );

      if (!Replaces) {
        Element[0].innerHTML = "";
        return;
      }
      if (Replaces.match(/\(\{\(\{SkyState-\d+\}\)\}\)/g))
        Replaces.match(/\(\{\(\{SkyState-\d+\}\)\}\)/g).forEach((match) => {
          // ...
        });

      const doc = parser.parseFromString(
        Replaces.replaceAll("<#>", "<SkyWraper>").replaceAll(
          "</#>",
          "</SkyWraper>"
        ),
        "text/html"
      );
      let root =
        [...doc.documentElement.querySelector("body").children].length === 1
          ? [
              doc.documentElement.querySelector("body").children[0],
              ...doc.documentElement.querySelector("body").children[0].children,
            ]
          : [...doc.documentElement.querySelector("body").children];
      if (root.length === 0) return "";
      let elements = allChildren({ children: root });
      Render(elements);
      Element[0].innerHTML = "";
      [...doc.documentElement.querySelector("body").children].forEach(
        (element) => Element[0].appendChild(element)
      );
    });
    [...Elements.values()].forEach((Element) => {
      if (!Element[1].includes(stateId)) return;
      let Replaces = Element[1].replaceAll(stateId, stateValue);
      if (Element[0].nodeType === 2) {
        Element[1].match(/\(\{\(\{SkyState-\d+\}\)\}\)/g).forEach((match) => {
          Replaces = Replaces.replaceAll(match, States.get(match));
        });
        if (Element[1].match(/\(\{\(\{SkyMerge-\d+\}\)\}\)/g))
          Element[1].match(/\(\{\(\{SkyMerge-\d+\}\)\}\)/g).forEach((match) => {
            Merges.forEach((Merge, MergeId) => {
              if (MergeId !== match) return;
              Replaces = Replaces.replaceAll(
                MergeId,
                Merge[2](
                  Merge[1].map((state) =>
                    States.has(state) ? States.get(state) : state
                  )
                )
              );
            });
          });
        Element[0].value = Replaces;
        return;
      }
      Element[1].match(/\(\{\(\{SkyState-\d+\}\)\}\)/g).forEach((match) => {
        Replaces = Replaces.replaceAll(match, States.get(match));
      });
      if (Element[1].match(/\(\{\(\{SkyMerge-\d+\}\)\}\)/g))
        Element[1].match(/\(\{\(\{SkyMerge-\d+\}\)\}\)/g).forEach((match) => {
          Merges.forEach((Merge, MergeId) => {
            if (MergeId !== match) return;
            Replaces = Replaces.replaceAll(
              MergeId,
              Merge[2](
                Merge[1].map((state) =>
                  States.has(state) ? States.get(state) : state
                )
              )
            );
          });
        });
      Element[0].textContent = Replaces;
    });
    if (stateValue instanceof Array)
      [...Lists.values()].forEach((List) => {
        if (!(List instanceof Array) || List[1] !== stateId) return;
        [...List[0].children].forEach((child) => child.remove());
        let doc = "";
        stateValue.forEach((ele) => (doc += List[2](ele)));
        List[0].innerHTML = doc;
      });
  }

  function onStateUpdate(func) {
    if (typeof func !== "function") return;
    Functions.set(stateId, func);
  }
  return [() => stateId, updateState, onStateUpdate];
}

/**
 * @desc Function to generate a unique reference ID
 * @dsec Generates a unique reference ID using the current timestamp and random number
 */
function Ref() {
  let refId = `({({SkyRef-${
    Date.now() * Math.floor(Math.random() * 10000000)
  }})})`;
  Refs.set(refId, [null]);

  function onReference(func) {
    if (typeof func !== "function") return;
    Refs.set(refId, [null, func]);
  }
  return [() => Refs.get(refId)[0] || refId, onReference];
}

/**
 * @desc This function parses a HTML string and renders it into a document object.
 * @dsec The Document() function takes in a HTML string as an argument and parses it into a document object. It also checks for any errors that may occur during the parsing process.
 * @param {string} htmlString - The HTML string to be parsed.
 */
function Document(htmlString) {
  let document;
  let error;

  if (htmlString instanceof Array) htmlString = htmlString[0];
  if (typeof htmlString !== "string") throw new Error("Invalid HTML string");
  else {
    const doc = parser.parseFromString(
      htmlString
        .replaceAll(/\<\#(\s+[^>]*?)?>/g, "<SkyWraper$1>")
        .replaceAll("</#>", "</SkyWraper>"),
      "text/html"
    );
    let root =
      [...doc.documentElement.querySelector("body").children].length === 1
        ? [
            doc.documentElement.querySelector("body").children[0],
            ...doc.documentElement.querySelector("body").children[0].children,
          ]
        : [...doc.documentElement.querySelector("body").children];
    if (root.length === 0) return "";
    let elements = allChildren({ children: root });
    Render(elements);
    if ([...doc.documentElement.querySelector("body").children].length !== 1)
      console.error(
        'Document elements must be grouped by a wrapper element or use "<#></#>"'
      );
  }
  return { document, error };
}

/**
 * @desc Function to get all children of an element
 * @param {Object} element - The element whose children are to be retrieved
 */
function allChildren(element) {
  let elements = [...element.children];
  for (let child of element.children) {
    if (child.children) elements = [...elements, ...allChildren(child)];
  }
  return elements;
}

/**
 * @desc Creates a document object from an HTML string
 * @param {string} htmlString - The HTML string to be parsed
 */
function Document(htmlString) {
  let document;
  let error;

  if (htmlString instanceof Array) htmlString = htmlString[0];
  if (typeof htmlString !== "string") throw new Error("Invalid HTML string");
  else {
    const doc = parser.parseFromString(
      htmlString
        .replaceAll(/\<\#(\s+[^>]*?)?>/g, "<SkyWraper$1>")
        .replaceAll("</#>", "</SkyWraper>"),
      "text/html"
    );
    let root =
      [...doc.documentElement.querySelector("body").children].length === 1
        ? [
            doc.documentElement.querySelector("body").children[0],
            ...doc.documentElement.querySelector("body").children[0].children,
          ]
        : [...doc.documentElement.querySelector("body").children];
    if (root.length === 0) return "";
    let elements = allChildren({ children: root });
    Render(elements);
    if ([...doc.documentElement.querySelector("body").children].length !== 1)
      console.error(
        'Document elements must be grouped by a wrapper element or use "<#></#>"'
      );
  }
  return { document, error };
}

/**
 * @desc Render elements
 * @param {Array} elements - Array of elements to render
 */
function render(elements) {
  elements.forEach((element) => {
    element.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        const skyListStateRegex = /\(\{\(\{Sky(List)?State-\d+\}\)\}\)/g;
        const skyListStateMatch = node.textContent.match(skyListStateRegex);
        if (skyListStateMatch) {
          Elements.add([
            node,
            node.textContent.replaceAll("({({SkyListState-", "({({SkyState-"),
          ]);
          skyListStateMatch.forEach((match) => {
            node.textContent = node.textContent.replaceAll(
              match,
              States.get(match.replaceAll("SkyListState", "SkyState"))
            );
          });
        }
      } else if (node.textContent.match(/\(\{\(\{SkyMerge-\d+\}\)\}\)/g)) {
        const skyMergeRegex = /\(\{\(\{SkyMerge-\d+\}\)\}\)/g;
        const skyMergeMatch = node.textContent.match(skyMergeRegex);
        if (skyMergeMatch && skyMergeMatch.length > 1) {
          node.textContent = node.textContent.replaceAll(skyMergeRegex, "");
        } else if (skyMergeMatch) {
          const match = skyMergeMatch[0];
          const merge = Merges.get(match);
          if (merge && typeof merge[1] === "function") {
            if (merge.length === 4) merge.splice(0, 1);
            Merges.set(match, [node, ...merge, node.textContent]);
            node.textContent = node.textContent.replace(
              match,
              merge[1](merge[0].map((state) => States.get(state) || state))
            );
          }
        }
      }
    });
  });

  elements.forEach((element) => {
    [...element.attributes].forEach((attr) => {
      if (attr.name === "ref") {
        const ref = element.getAttribute("ref");
        if (Refs.has(ref)) {
          const func = Refs.get(ref)[1];
          Refs.set(ref, [element]);
          if (func) func(element);
          element.removeAttribute("ref");
        }
      } else if (attr.name.startsWith("on-") && attr.value) {
        const eventType = attr.name.split("-")[1].toLowerCase();
        const handler =
          EventHandlers.get(attr.value) ||
          new Function(`return ${attr.value}`)();
        element.addEventListener(eventType, handler);
        element.removeAttribute(attr.name);
      } else if (attr.value) {
        const skyStateRegex = /\(\{\(\{SkyState-\d+\}\)\}\)/g;
        const skyStateMatch = attr.value.match(skyStateRegex);
        if (skyStateMatch) {
          Elements.add([attr, attr.value]);
          skyStateMatch.forEach((match) => {
            attr.value = attr.value.replaceAll(
              match,
              States.get(match) || match
            );
          });
        }
        if (attr.value.match(/\(\{\(\{SkyMerge-\d+\}\)\}\)/g)) {
          attr.value.match(/\(\{\(\{SkyMerge-\d+\}\)\}\)/g).forEach((match) => {
            const merge = Merges.get(match);
            if (merge) {
              if (merge.length === 4) merge.splice(0, 1);
              Merges.set(match, [attr, ...merge, attr.value]);
              attr.value = attr.value.replaceAll(
                match,
                merge[1](merge[0].map((state) => States.get(state) || state))
              );
            }
          });
        }
      }
    });
  });
}

/**
 * @desc Function to render a list of elements
 * @param {Array} list - The array of elements to be rendered
 * @param {Function} callback - The function to be called for each element in the list
 */
function ForList(list, callback) {
  let [ref, onRef] = Ref();
  let refId = ref();
  let listId = null;
  let doc = "";
  onRef((element) => {
    if (listId) Lists.add([element, listId, callback]);
    else {
      Render(allChildren(element));
    }
    Refs.delete(refId);
  });
  if (
    typeof list === "string" &&
    list.match(/\(\{\(\{SkyState-\d+\}\)\}\)/g)[0] &&
    list === list.match(/\(\{\(\{SkyState-\d+\}\)\}\)/g)[0]
  ) {
    listId = list.match(/\(\{\(\{SkyState-\d+\}\)\}\)/g)[0];
    list = States.get(listId);
  }
  if (!(list instanceof Array)) {
    // Maybe adding Object
    console.error("List is not an array");
    return "";
  }
  if (typeof callback !== "function") {
    console.error("Callback is not a function");
    return;
  }
  list.forEach((ele) => {
    if (typeof ele === "string" && ele.match(/\(\{\(\{SkyState-\d+\}\)\}\)/g)) {
      ele.match(/\(\{\(\{SkyState-\d+\}\)\}\)/g).forEach((match) => {
        ele = ele.replaceAll(
          match,
          match.replaceAll("SkyState", "SkyListState")
        );
      });
    }
    doc += callback(ele);
  });
  return `<SkyList ref="${ref()}">${doc}</SkyList>`;
}

/**
 * @desc Merges the given states and returns a unique identifier
 * @param {Array} states - The array of states to be merged
 * @param {Function} callback - The callback function to be executed after merging
 */
function Merge(states, callback) {
  if (typeof callback !== "function") return;
  if (!(states instanceof Array)) return;
  let mergeId = `({({SkyMerge-${
    Date.now() * Math.floor(Math.random() * 10000000)
  }})})`;
  Merges.set(mergeId, [states, callback]);
  return mergeId;
}

/**
 * @desc Function to conditionally render a component
 * @param {Array} states - An array of states
 * @param {Function} callback - A callback function
 */
function Conditional(states, callback) {
  if (typeof callback !== "function") return;
  if (!(states instanceof Array)) return;
  let [ref, onRef] = Ref();
  let refId = ref();
  onRef((element) => {
    Conditions.add([element, states, callback]);
    Refs.delete(refId);
  });
  let condition = callback(
    states.map((state) => (States.has(state) ? States.get(state) : state))
  );
  return `<SkyCondition ref="${ref()}">${condition ?? ""}</SkyCondition>`;
}

/**
 * @desc Creates a unique event handler ID and stores the callback in EventHandlers map
 * @param {Function} callback - The callback function to be stored in EventHandlers map
 */
function EventHandler(callback) {
  let eventHandlerId = `({({SkyEventHandler-${
    Date.now() * Math.floor(Math.random() * 10000000)
  }})})`;
  EventHandlers.set(eventHandlerId, callback);
  return eventHandlerId;
}
