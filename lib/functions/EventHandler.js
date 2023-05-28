const EventHandlers = new Map();

function EventHandler(callback) {
    let eventHandlerId = `SkyEventHandler-${Date.now() * Math.floor(Math.random() * 10000000)}`;
    EventHandlers.set(eventHandlerId, callback);
    return eventHandlerId;
};

export { EventHandler, EventHandlers };
