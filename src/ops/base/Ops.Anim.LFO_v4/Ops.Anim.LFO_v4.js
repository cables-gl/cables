const
    MODE_AUTO = "Auto",
    MODE_TIME_INPUT = "Time Input",
    MODE_TIMELINE = "Timeline";

const
    inFrequency = op.inFloat("Frequency", 1),
    inType = op.inDropDown("Waveform", ["sine", "triangle", "ramp up", "ramp down", "square", "random", "smooth random"], "sine"),
    inPulseWidth = op.inFloatSlider("Pulse Width", 0.5),
    inSeed = op.inFloat("Seed", 0),
    inPhase = op.inFloat("Phase", 0),

    inMode = op.inSwitch("Timer", [MODE_AUTO, MODE_TIME_INPUT, MODE_TIMELINE], MODE_AUTO),
    inTime = op.inFloat("Time"),
    inPlay = op.inBool("Play", true),
    inReset = op.inTriggerButton("Reset"),

    inRangeMin = op.inFloat("Range Min", -1),
    inRangeMax = op.inFloat("Range Max", 1),

    outResult = op.outNumber("Result"),
    outCyclePos = op.outNumber("Cycle Position"),
    outCycle = op.outTrigger("Cycle");

op.setPortGroup("Timer", [inMode, inTime, inPlay, inReset]);
op.setPortGroup("Waveform", [inType, inPulseWidth, inSeed, inPhase]);
op.setPortGroup("Range", [inRangeMin, inRangeMax]);

const TWO_PI = Math.PI * 2;
const RANDOM_HASH_A = 12.9898;
const RANDOM_HASH_B = 78.233;
const RANDOM_HASH_SCALE = 43758.5453;

const timer = new CABLES.Timer();
let lastTimerTime = null;
let pos = 0;
let lastCycle = 0;

inType.onChange = updateUi;
inMode.onChange = updateUi;
inPlay.onChange = updatePlay;
inReset.onTriggered = reset;

inPulseWidth.onChange =
    inSeed.onChange =
    inPhase.onChange =
    inRangeMin.onChange =
    inRangeMax.onChange = update;

inTime.onChange =
    inFrequency.onChange = () =>
    {
        if (inMode.get() == MODE_TIME_INPUT) setPos(inTime.get() * inFrequency.get());
        else update();
    };

op.patch.addOnAnimFrame(op);
op.onDelete = () => { op.patch.removeOnAnimFrame(op); };

updatePlay();
updateUi();

function updateUi()
{
    const mode = inMode.get();

    const type = inType.get();
    inPulseWidth.setUiAttribs({ "greyout": type != "square" });
    inSeed.setUiAttribs({ "greyout": type != "random" && type != "smooth random" });
    inTime.setUiAttribs({ "greyout": mode != MODE_TIME_INPUT });
    inPlay.setUiAttribs({ "greyout": mode != MODE_AUTO });
    inReset.setUiAttribs({ "greyout": mode != MODE_AUTO });

    if (mode == MODE_TIME_INPUT) setPos(inTime.get() * inFrequency.get());
    else update();
}

function updatePlay()
{
    if (inPlay.get()) timer.play();
    else timer.pause();
}

function reset()
{
    lastTimerTime = null;
    timer.setTime(0);
    lastCycle = 0;
    setPos(0);
}

op.onAnimFrame = (time) =>
{
    const mode = inMode.get();
    if (mode == MODE_TIME_INPUT) return;

    if (CABLES.overwriteTime !== undefined)
    {
        setPos(CABLES.overwriteTime * inFrequency.get());
        return;
    }
    if (mode == MODE_TIMELINE)
    {
        setPos(time * inFrequency.get());
        return;
    }

    timer.update();
    const timerTime = timer.get();

    if (lastTimerTime === null) lastTimerTime = timerTime;
    const delta = Math.abs(timerTime - lastTimerTime);
    lastTimerTime = timerTime;

    if (!timer.isPlaying()) return;

    setPos(pos + delta * inFrequency.get());
};

function setPos(p)
{
    if (p != p) p = 0;
    pos = p;
    update();
}

function update()
{
    const shifted = pos + inPhase.get();
    const cycle = Math.floor(shifted);
    const p = shifted - cycle;

    outResult.set(CABLES.map(wave(p, cycle), -1, 1, inRangeMin.get(), inRangeMax.get()));
    outCyclePos.set(p);

    if (cycle != lastCycle)
    {
        lastCycle = cycle;
        outCycle.trigger();
    }
}

function random(cycle)
{
    const x = Math.sin(cycle * RANDOM_HASH_A + inSeed.get() * RANDOM_HASH_B) * RANDOM_HASH_SCALE;
    return (x - Math.floor(x)) * 2 - 1;
}

function wave(p, cycle)
{
    const type = inType.get();

    if (type == "random") return random(cycle);
    if (type == "smooth random")
    {
        const smooth = p * p * (3 - 2 * p);
        const from = random(cycle);
        return from + (random(cycle + 1) - from) * smooth;
    }

    if (type == "triangle")
    {
        if (p < 0.5) return p * 4 - 1;
        return 3 - p * 4;
    }
    if (type == "ramp up") return p * 2 - 1;
    if (type == "ramp down") return 1 - p * 2;
    if (type == "square")
    {
        if (p < 1 - inPulseWidth.get()) return -1;
        return 1;
    }

    return -Math.cos(p * TWO_PI);
}
