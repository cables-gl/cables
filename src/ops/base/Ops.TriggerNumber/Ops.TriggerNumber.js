this.name='trigger number';
var number=this.addOutPort(new Port(this,"number",OP_PORT_TYPE_VALUE));

var exe0=this.addInPort(new Port(this,"0",OP_PORT_TYPE_FUNCTION));
exe0.onTriggered=function(){ number.set(0); };

var exe1=this.addInPort(new Port(this,"1",OP_PORT_TYPE_FUNCTION));
exe1.onTriggered=function(){ number.set(1); };


var exe2=this.addInPort(new Port(this,"2",OP_PORT_TYPE_FUNCTION));
exe2.onTriggered=function(){ number.set(2); };

var exe3=this.addInPort(new Port(this,"3",OP_PORT_TYPE_FUNCTION));
exe3.onTriggered=function(){ number.set(3); };

var exe4=this.addInPort(new Port(this,"4",OP_PORT_TYPE_FUNCTION));
exe4.onTriggered=function(){ number.set(4); };

var exe5=this.addInPort(new Port(this,"5",OP_PORT_TYPE_FUNCTION));
exe5.onTriggered=function(){ number.set(5); };

var exe6=this.addInPort(new Port(this,"6",OP_PORT_TYPE_FUNCTION));
exe6.onTriggered=function(){ number.set(6); };

var exe7=this.addInPort(new Port(this,"7",OP_PORT_TYPE_FUNCTION));
exe7.onTriggered=function(){ number.set(7); };

