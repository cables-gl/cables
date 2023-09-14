const
    inData = op.inObject("Data"),
    // inFilter = op.inSwitch("Filter", ["Note Name", "Midi"], "Note Name"),
    inNote = op.inString("Note"),
    // inNoteMidi = op.inInt("Midi"),
    inChannel = op.inValueString("Channel", -1),
    inStartBeat = op.inValueInt("Beat Start", 0),
    inEndBeat = op.inValueInt("Beat End", 0),

    outCount = op.outNumber("Count"),
    outProgress = op.outNumber("Progress"),
    outTimeSince = op.outNumber("Time since last"),
    outTrigger = op.outTrigger("Trigger"),
    outReset = op.outTrigger("Reseted");

let lastBeat = 0;
let counter = 0;
let oldNames = null;
let oldProgress = null;
let lastHit = 0;
let notfound = true;

inNote.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": "" + inNote.get() });
};

inData.onChange = function ()
{
    const data = inData.get();
    if (!data) return;
    const beat = data.beat;

    if (inStartBeat.get() != inEndBeat.get())
    {
        if (beat < inStartBeat.get()) return;
        if (beat > inEndBeat.get()) return;
    }

    const names = data.names;
    const progress = data.progress;
    if (!names) return;
    if (!progress) return;

    if (beat < lastBeat)
    {
        counter = 0;
        lastHit = 0;
        notfound = true;
        outTimeSince.set(0);
        outReset.trigger();
    }
    lastBeat = beat;

    const note = inNote.get();

    if (!oldNames)
    {
        oldNames = [];
        oldProgress = [];
        oldNames.length = names.length;
        oldProgress.length = names.length;
    }

    let startChn = 0;
    let endChn = names.length;

    if (inChannel.get() >= 0)
    {
        startChn = inChannel.get();
        endChn = startChn + 1;
    }

    let prog = 0;
    let progCount = 0;

    for (let i = startChn; i < endChn; i++)
    {
        if (names[i] == note)
        {
            if ((oldNames[i] != note) || notfound) // ( oldNames[i]==note && progress[i]<oldProgress[i])
            {
                counter++;
                lastHit = CABLES.now();
                outTrigger.trigger();
            }

            progCount++;
            prog += progress[i];
            notfound = false;
        }

        oldNames[i] = names[i];
        oldProgress[i] = progress[i];
    }

    if (progCount == 0)notfound = true;
    else outProgress.set((prog / progCount) || 0);

    if (lastHit !== 0) outTimeSince.set((CABLES.now() - lastHit) / 1000);

    outCount.set(counter);
};
