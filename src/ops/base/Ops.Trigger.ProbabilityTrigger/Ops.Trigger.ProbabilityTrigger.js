const inTrigger = op.inTrigger("Trigger In");
const inProbability = op.inFloatSlider("Probability", 0.5);
const outTrigger = op.outTrigger("Trigger Output");
const outInverseTrigger = op.outTrigger("Inverse Trigger Output");
Math.randomSeed = 0;

let scheduleUpdate = false;
let probability = inProbability.get();
inProbability.onChange = () =>
{
    if (inTrigger.isLinked())
    {
        scheduleUpdate = true;
        return;
    }
    probability = inProbability.get();
};

inTrigger.onTriggered = () =>
{
    if (scheduleUpdate)
    {
        probability = inProbability.get();
        scheduleUpdate = false;
    }
    if (probability >= 1)
    {
        outTrigger.trigger();
        return;
    }

    if (probability <= 0)
    {
        outInverseTrigger.trigger();
        return;
    }
    if (Math.seededRandom() < probability)
    {
        outTrigger.trigger();
    }
    else
    {
        outInverseTrigger.trigger();
    }
};
