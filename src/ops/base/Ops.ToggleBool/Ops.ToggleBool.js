this.name='ToggleBool';

var trigger=this.addInPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var outBool=this.addOutPort(new Port(this,"result",OP_PORT_TYPE_VALUE));
outBool.ignoreValueSerialize=true;
var theBool=false;

trigger.onTriggered=function()
{
    console.log('togglebool!');
    theBool=!theBool;
    outBool.set(theBool);
};

outBool.set(theBool);
