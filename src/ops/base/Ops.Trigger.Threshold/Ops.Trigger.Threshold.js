// This op will send one trigger out if the threshold has been crossed
// but will not send another until the incoming inValue
// drops below the threshold and go's above it again
// A boolean output also reports when within the threshold levels

const inValue = op.inFloat("Input"),
    inThreshold = op.inFloat("Threshold"),
    inDirection = op.inSwitch("Trigger", ["Below", "Above"], "Above"),
    output = op.outTrigger("Output"),
    outBool = op.outBoolNum("Triggered");

let hasThresholdBeenExceeded = false;

inValue.onChange = update;
inThreshold.onChange = update;

inDirection.onChange = function ()
{
    hasThresholdBeenExceeded = false;
    update();
};

function update()
{
    const isThresholdReached = inDirection.get() === "Below"
        ? inValue.get() <= inThreshold.get()
        : inValue.get() >= inThreshold.get();

    outBool.set(isThresholdReached ? 1 : 0);

    if (!hasThresholdBeenExceeded && isThresholdReached)
    {
        hasThresholdBeenExceeded = true;
        output.trigger();
    }
    else if (hasThresholdBeenExceeded && !isThresholdReached)
    {
        hasThresholdBeenExceeded = false;
    }
}
