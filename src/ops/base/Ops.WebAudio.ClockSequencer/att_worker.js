let timerIDs = [];
let timerID = null;
const LOOKAHEAD_IN_MS = 25.;
onmessage = (e) => {
    if (e.data === "start") {
        timerID = setInterval(() => postMessage("tick"), LOOKAHEAD_IN_MS);
        return;
    }

    if (e.data === "stop") {
        clearInterval(timerID);
        timerID = null;
        console.log("stopped");
    }
};

onerror = (e) => {
    console.log("worker error", e);
}
