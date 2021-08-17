const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

const inBPM = op.inInt("BPM", 100);
const inStart = op.inTriggerButton("Start");
const inStop = op.inTriggerButton("Stop");
const inReset = op.inTriggerButton("Reset");

const outTriggers = [];
for (let i = 0; i < 7 * 3; i += 1)
{
    const noteValue = Math.pow(2, i % 7);
    let string = "1/" + noteValue;
    if (i > 6 && i < 14)
    {
        string = "1/" + noteValue + " Triplet";
    }
    else if (i > 13)
    {
        string = "1/" + noteValue + " Dotted";
    }
    outTriggers[i] = op.outTrigger(string + " Note Trigger");
}

const outRunning = op.outBool("Sequencer Running");
const outBPM = op.outNumber("BPM Out");
const outStart = op.outTrigger("Start Out");
const outStop = op.outTrigger("Stop Out");
const outReset = op.outTrigger("Reset Out");

const MIN_BPM = 20;

const NOTE_QUEUE = [];
const LOOKAHEAD_IN_MS = 25.0;
const SCHEDULEAHEAD_IN_S = 0.1;

const MULTIPLIERS = [
    4, 2, 1, 1 / 2, 1 / 4, 1 / 8, 1 / 16,
    8 / 3, 4 / 3, 2 / 3, 1 / 3, 1 / 6, 1 / 12, 1 / 24, // triplet
    6, 3, 3 / 2, 3 / 4, 3 / 8, 3 / 16, 3 / 32 // dotted
];

const MODULO_PER_NOTE = MULTIPLIERS.map((val) => Math.floor(val * 48 / 2));
const TICK_INDEX = 7 * 2 - 1; // 1/64 triplet fastest note
const MAX_ENUMERATOR = 288;
let NOTES_IN_S = [];
let QUARTER_NOTE_S = 60 / inBPM.get();
NOTES_IN_S = MULTIPLIERS.map((multiplier) => multiplier * QUARTER_NOTE_S);
let TICK_S = NOTES_IN_S[TICK_INDEX] / 2;

outBPM.set(inBPM.get());

let resetTickCount = false;
let changeWhileRunning = false;
inBPM.onChange = updateBpm;

let worker = null;
let isPlaying = false;
let currentNote = 0;
let nextNoteTime = null;
let tickCount = 0;
let workerRunning = false;
let waitForSchedule = false;
updateBpm();

function updateBpm()
{
    outBPM.set(inBPM.get());

    if (workerRunning)
    {
        changeWhileRunning = true;
        return;
    }
    QUARTER_NOTE_S = 60 / inBPM.get();
    NOTES_IN_S = MULTIPLIERS.map((multiplier) => multiplier * QUARTER_NOTE_S);
    TICK_S = NOTES_IN_S[TICK_INDEX];
}

function nextNote()
{
    nextNoteTime += TICK_S;
    tickCount = (tickCount + 1) % MAX_ENUMERATOR;
}

function scheduleNote()
{
    if (waitForSchedule)
    { // code block to swallow initial hickup when starting the sequencer
        let compareValue = 8;
        if (inBPM.get() > 140) compareValue = 12;
        if (inBPM.get() > 160) compareValue = 20;
        if (tickCount === compareValue)
        { // half of highest value
            resetTickCount = true;
            waitForSchedule = false;
        }
        else
        {
            return;
        }
    }

    if (resetTickCount)
    {
        tickCount = 0;
        resetTickCount = false;
    }
    for (let i = 0, len = MODULO_PER_NOTE.length; i < len; i += 1)
    {
        if (tickCount % MODULO_PER_NOTE[i] === 0) outTriggers[i].trigger();
    }
}
function startScheduling()
{
    if (changeWhileRunning)
    {
        QUARTER_NOTE_S = 60 / inBPM.get();
        NOTES_IN_S = MULTIPLIERS.map((multiplier) => multiplier * QUARTER_NOTE_S);
        TICK_S = NOTES_IN_S[TICK_INDEX];
        changeWhileRunning = false;
    }
    while (nextNoteTime < audioCtx.currentTime + SCHEDULEAHEAD_IN_S)
    {
        scheduleNote();
        nextNote();
    }
}

inStart.onTriggered = () =>
{
    if (workerRunning) return;

    if (!worker)
    {
        const blob = new Blob([attachments.worker_js], { "type": "text/javascript" });
        const fileURL = URL.createObjectURL(blob);

        worker = new Worker(fileURL, { "name": "ClockSequencer with op-id: " + op.id });
        worker.addEventListener("message", (e) =>
        {
            if (e.data === "tick") startScheduling();
            if (e.data === "stopped") workerRunning = false;
        },
        false);

        nextNoteTime = audioCtx.currentTime;
        /* dummy buffer source for time */
        const audioBuffer = audioCtx.createBufferSource();
        audioBuffer.start(0);
        workerRunning = true;
        tickCount = 0;
        worker.postMessage("start");
        waitForSchedule = true;
        outRunning.set(workerRunning);
    }

    outStart.trigger();
};

inStop.onTriggered = () =>
{
    if (worker)
    {
        worker.postMessage("stop");
        worker.terminate();
        worker = null;
        workerRunning = false;
        outRunning.set(workerRunning);
    }

    outStop.trigger();
};

inReset.onTriggered = () =>
{
    resetTickCount = true;
    outReset.trigger();
};

op.onDelete = () =>
{
    if (!inStart.isLinked())
    {
        if (worker)
        {
            worker.postMessage("stop");
            worker.terminate();
            worker = null;
            workerRunning = false;
        }
    }
};
inStart.onLinkChanged = () =>
{
    if (!inStart.isLinked())
    {
        if (worker)
        {
            worker.postMessage("stop");
            worker.terminate();
            worker = null;
            workerRunning = false;
            outRunning.set(workerRunning);
        }
    }
};
