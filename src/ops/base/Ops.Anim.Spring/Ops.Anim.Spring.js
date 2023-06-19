const
    inTrig = op.inTrigger("exe"),
    inValue = op.inFloat("value", 0.0),
    inDamping = op.inFloatSlider("damping", 0.20),
    inStiffness = op.inFloatSlider("stiffness", 0.7),
    outTrig = op.outTrigger("trigger"),
    outResult = op.outNumber("result");

let lastTime = CABLES.now();
let diff = 0;

let currentValue = 0.0;
let currentVelocity = 0.0;
let stiffness = inStiffness.get();
let damping = inDamping.get();
let valueThreshold = 0.001;
let velocityThreshold = 0.001;

inDamping.onChange = function ()
{
    damping = inDamping.get();
};

inStiffness.onChange = function ()
{
    stiffness = inStiffness.get();
};

inTrig.onTriggered = function ()
{
    diff = (CABLES.now() - lastTime);

    let dampingFactor = Math.max(0, 1 - damping * 50 * diff * 0.001);
    let acceleration = (inValue.get() - currentValue) * stiffness * 10 * diff * 0.01;
    currentVelocity = currentVelocity * dampingFactor + acceleration;
    currentValue += currentVelocity * diff * 0.01;

    if ((Math.abs(currentValue - inValue.get()) < valueThreshold) && (Math.abs(currentVelocity) < velocityThreshold))
    {
        currentValue = inValue.get();
        currentVelocity = 0;
    }

    outResult.set(currentValue);
    lastTime = CABLES.now();
    outTrig.trigger();
};
