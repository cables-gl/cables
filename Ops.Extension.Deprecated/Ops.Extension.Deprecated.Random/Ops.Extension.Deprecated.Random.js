let exe = op.inTriggerButton("exe");
let minusPlusOne = op.addInPort(new CABLES.Port(op, "0 to x / -x to x ", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
let max = op.inValue("max", 1);
let seed = op.inValue("random seed", 0);
let result = op.outValue("result");

exe.onTriggered = calcRandom;
seed.onChange = calcRandom;
max.onChange = calcRandom;

calcRandom();

let oldSeed = 0;
function calcRandom()
{
    oldSeed = Math.randomSeed;
    Math.randomSeed = seed.get();
    if (minusPlusOne.get()) result.set((Math.seededRandom() * max.get()) * 2 - max.get());
    else result.set(Math.seededRandom() * max.get());

    Math.randomSeed = oldSeed;
}
