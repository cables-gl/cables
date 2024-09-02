const DEFAULT_BPM = 127;

const
    exe = op.inTrigger("exe"),
    tap = op.inTriggerButton("tap"),
    sync = op.inTriggerButton("sync"),
    nudgeLeft = op.inTriggerButton("nudgeLeft"),
    nudgeRight = op.inTriggerButton("nudgeRight"),
    inActive = op.inBool("Active", true),
    beat = op.outTrigger("beat"),
    bpm = op.outNumber("Bpm", DEFAULT_BPM),
    outStates = op.outArray("States"),
    beatNum = op.outNumber("Beat Index");

const DEFAULT_MILLIS = bpmToMillis(DEFAULT_BPM);
const NUDGE_VALUE = 0.5; // to add / substract from avg bpm

op.toWorkPortsNeedToBeLinked(exe);

let lastFlash = -1;
let lastTap = -1;

const taps = [];

let avgBpm = DEFAULT_BPM;
let avgMillis = getAvgMillis();

let beatCounter = 1; // [1, 2, 3, 4]
const states = [1, 0, 0, 0];

exe.onTriggered = function ()
{
    if (op.patch.freeTimer.get() * 1000 < lastFlash)
    {
        lastFlash = op.patch.freeTimer.get() * 1000;
    }

    if (op.patch.freeTimer.get() * 1000 > lastFlash + avgMillis)
    {
        if (inActive.get())
        {
            beat.trigger();
            incrementState();
            outStates.set(null);
            outStates.set(states);

            if (taps.length > 0) bpm.set(millisToBpm(avgMillis));
        }

        lastFlash = op.patch.freeTimer.get() * 1000;
    }
};

function incrementState()
{
    beatCounter++;
    if (beatCounter > 4)
    {
        beatCounter = 1;
    }
    for (let i = 0; i < 4; i++)
    {
        states[i] = 0;
    }
    states[beatCounter - 1] = 1;

    beatNum.set(beatCounter - 1);
}

function tapPressed()
{
    if (document.hidden) return;
    // start new tap session
    if (op.patch.freeTimer.get() * 1000 - lastTap > 1000)
    {
        taps.length = 0;
        beatCounter = 0;
    }
    else
    {
        taps.push(op.patch.freeTimer.get() * 1000 - lastTap);
    }
    lastTap = op.patch.freeTimer.get() * 1000;
    avgMillis = getAvgMillis();
}

function millisToBpm(millis)
{
    return Number(60 * 1000 / millis).toFixed(2);
}

function bpmToMillis(bpms)
{
    return 60 * 1000 / bpms;
}

function getAvgMillis()
{
    if (taps.length >= 1)
    {
        let sum = 0.0;
        for (let i = 0; i < taps.length; i++)
        {
            sum += taps[i];
        }
        return sum / taps.length;
    }
    else
    {
        return DEFAULT_MILLIS;
    }
}

function syncPressed()
{
    // on next execute everything will be reset to first beat
    lastFlash = -1;
    beatCounter = 0;
}

function nudgeLeftPressed()
{
    avgBpm += NUDGE_VALUE;
    avgMillis = bpmToMillis(avgBpm);
}

function nudgeRightPressed()
{
    avgBpm -= NUDGE_VALUE;
    avgMillis = bpmToMillis(avgBpm);
}

tap.onTriggered = tapPressed;
sync.onTriggered = syncPressed;
nudgeLeft.onTriggered = nudgeLeftPressed;
nudgeRight.onTriggered = nudgeRightPressed;

//
