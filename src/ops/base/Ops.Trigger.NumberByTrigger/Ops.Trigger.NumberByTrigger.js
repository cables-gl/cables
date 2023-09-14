const
    exe0 = op.inTriggerButton("0"),
    exe1 = op.inTriggerButton("1"),
    exe2 = op.inTriggerButton("2"),
    exe3 = op.inTriggerButton("3"),
    exe4 = op.inTriggerButton("4"),
    exe5 = op.inTriggerButton("5"),
    exe6 = op.inTriggerButton("6"),
    exe7 = op.inTriggerButton("7"),
    number = op.outNumber("number");

number.changeAlways = true;
const outTrig = op.outTrigger("Triggered");

exe0.onTriggered = function () { number.set(0); outTrig.trigger(); };
exe1.onTriggered = function () { number.set(1); outTrig.trigger(); };
exe2.onTriggered = function () { number.set(2); outTrig.trigger(); };
exe3.onTriggered = function () { number.set(3); outTrig.trigger(); };
exe4.onTriggered = function () { number.set(4); outTrig.trigger(); };
exe5.onTriggered = function () { number.set(5); outTrig.trigger(); };
exe6.onTriggered = function () { number.set(6); outTrig.trigger(); };
exe7.onTriggered = function () { number.set(7); outTrig.trigger(); };
