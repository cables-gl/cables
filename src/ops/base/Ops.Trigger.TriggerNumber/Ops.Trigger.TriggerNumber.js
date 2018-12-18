var number=op.addOutPort(new CABLES.Port(op,"number",CABLES.OP_PORT_TYPE_VALUE));

var exe0=op.addInPort(new CABLES.Port(op,"0",CABLES.OP_PORT_TYPE_FUNCTION));
exe0.onTriggered=function(){ number.set(0); };

var exe1=op.addInPort(new CABLES.Port(op,"1",CABLES.OP_PORT_TYPE_FUNCTION));
exe1.onTriggered=function(){ number.set(1); };


var exe2=op.addInPort(new CABLES.Port(op,"2",CABLES.OP_PORT_TYPE_FUNCTION));
exe2.onTriggered=function(){ number.set(2); };

var exe3=op.addInPort(new CABLES.Port(op,"3",CABLES.OP_PORT_TYPE_FUNCTION));
exe3.onTriggered=function(){ number.set(3); };

var exe4=op.addInPort(new CABLES.Port(op,"4",CABLES.OP_PORT_TYPE_FUNCTION));
exe4.onTriggered=function(){ number.set(4); };

var exe5=op.addInPort(new CABLES.Port(op,"5",CABLES.OP_PORT_TYPE_FUNCTION));
exe5.onTriggered=function(){ number.set(5); };

var exe6=op.addInPort(new CABLES.Port(op,"6",CABLES.OP_PORT_TYPE_FUNCTION));
exe6.onTriggered=function(){ number.set(6); };

var exe7=op.addInPort(new CABLES.Port(op,"7",CABLES.OP_PORT_TYPE_FUNCTION));
exe7.onTriggered=function(){ number.set(7); };

