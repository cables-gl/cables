const exe0=op.inTriggerButton("0");
const exe1=op.inTriggerButton("1");
const exe2=op.inTriggerButton("2");
const exe3=op.inTriggerButton("3");
const exe4=op.inTriggerButton("4");
const exe5=op.inTriggerButton("5");
const exe6=op.inTriggerButton("6");
const exe7=op.inTriggerButton("7");
const number=op.outValue("number");

exe0.onTriggered=function(){ number.set(0); };
exe1.onTriggered=function(){ number.set(1); };
exe2.onTriggered=function(){ number.set(2); };
exe3.onTriggered=function(){ number.set(3); };
exe4.onTriggered=function(){ number.set(4); };
exe5.onTriggered=function(){ number.set(5); };
exe6.onTriggered=function(){ number.set(6); };
exe7.onTriggered=function(){ number.set(7); };
