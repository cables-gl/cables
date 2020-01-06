const
    exe=op.inTrigger("exe"),
    trigOut = op.outTrigger("Trigger out"),
    result=op.outValue("result"),
    mode =op.inSwitch("Mode",['Sine','Cosine'],'Sine'),
    phase=op.inValueFloat("phase",0),
    mul=op.inValueFloat("frequency",1),
    amplitude=op.inValueFloat("amplitude",1);

var selectIndex = 0;
const SINE = 0;
const COSINE = 1;

op.toWorkPortsNeedToBeLinked(exe);

exec();
onModeChange();

function onModeChange()
{
    var modeSelectValue = mode.get();

    if(modeSelectValue === 'Sine') selectIndex = SINE;
        else if(modeSelectValue === 'Cosine') selectIndex = COSINE;

    op.setUiAttrib({"extendTitle":modeSelectValue});
    exec();
}
function exec()
{
    if(selectIndex == SINE) result.set( amplitude.get() * Math.sin( (op.patch.freeTimer.get()*mul.get()) + phase.get() ));
        else result.set( amplitude.get() * Math.cos( (op.patch.freeTimer.get()*mul.get()) + phase.get() ));
    trigOut.trigger();
}
exe.onTriggered=exec;
mode.onChange=onModeChange;