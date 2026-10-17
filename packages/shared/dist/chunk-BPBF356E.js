// src/events.ts
var socketEvents = {
  orderNew: "order:new",
  orderUpdate: "order:update",
  orderReady: "order:ready",
  leadNew: "lead:new",
  leadScored: "lead:scored",
  followupDone: "followup:done",
  presencePing: "presence:ping"
};
var socketEventNames = Object.values(
  socketEvents
);
var LATENCY_DEBOUNCE_MS = 250;
var PRESENCE_PING_INTERVAL_MS = 15e3;

export {
  socketEvents,
  socketEventNames,
  LATENCY_DEBOUNCE_MS,
  PRESENCE_PING_INTERVAL_MS
};
//# sourceMappingURL=chunk-BPBF356E.js.map