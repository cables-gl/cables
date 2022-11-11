const
    exe = op.inTrigger("exe"),
    mode = op.inSwitch("Mode", ["Sine", "Cosine"], "Sine"),
    phase = op.inValueFloat("phase", 0),
    mul = op.inValueFloat("frequency", 1),
    amplitude = op.inValueFloat("amplitude", 1),
    trigOut = op.outTrigger("Trigger out"),
    result = op.outNumber("result");

let selectIndex = 0;
const SINE = 0;
const COSINE = 1;

op.toWorkPortsNeedToBeLinked(exe);

exe.onTriggered = exec;
mode.onChange = onModeChange;

exec();
onModeChange();

function onModeChange()
{
    let modeSelectValue = mode.get();

    if (modeSelectValue === "Sine") selectIndex = SINE;
    else if (modeSelectValue === "Cosine") selectIndex = COSINE;

    exec();
}

function exec()
{
    if (selectIndex == SINE) result.set(amplitude.get() * Math.sin((op.patch.freeTimer.get() * mul.get()) + phase.get()));
    else result.set(amplitude.get() * Math.cos((op.patch.freeTimer.get() * mul.get()) + phase.get()));
    trigOut.trigger();
}
