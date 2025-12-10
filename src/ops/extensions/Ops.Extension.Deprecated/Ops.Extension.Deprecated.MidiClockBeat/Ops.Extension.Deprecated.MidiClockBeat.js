let eventIn = op.inObject("Event Input");

let triggerTick = op.outTrigger("Beat");

let triggerStart = op.outTrigger("Start");

let outSubTick = op.outValue("Sub Tick");
let triggerSub = op.outTrigger("Sub Beat");

let clockStart = 0xFA;// 0b11111010;
let clockTick = 0xF8;// 0b11111000;
let tickCount = 0;

let lastBeat = 0;
// var beatCountStart=0;

let outBPM = op.outValue("BPM");
let outBeatDuration = op.outValue("Tick Duration");

eventIn.onChange = function ()
{
    if (!eventIn.get()) return;

    let data = eventIn.get().data;

    // var data = _event.data;
    let isTick = data[0] == clockTick;
    let isStart = data[0] == clockStart;

    if (isStart)
    {
        tickCount = 0;
        triggerStart.trigger();
    }
    else if (isTick)
    {
        if (tickCount == 0)
        {
            if (lastBeat != 0)
            {
                let diff = CABLES.now() - lastBeat;
                let bpm = 60 * 1000 / diff;
                outBPM.set(bpm);
                outBeatDuration.set(60 / bpm / 4);
            }

            lastBeat = CABLES.now();
            triggerTick.trigger();
        }
        if (tickCount % 6 == 0)triggerSub.trigger();

        tickCount++;

        if (tickCount % 24 == 0) tickCount = 0;
    }

    outSubTick.set(tickCount);
};
