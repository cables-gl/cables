op.name='ArrayIterator 3x';
var exe=op.addInPort(new CABLES.Port(op,"Execute",CABLES.OP_PORT_TYPE_FUNCTION));
var arr=op.addInPort(new CABLES.Port(op,"Array",CABLES.OP_PORT_TYPE_ARRAY));
var mod=op.inValue("Modulo",1);
arr.ignoreValueSerialize=true;


var trigger=op.addOutPort(new CABLES.Port(op,"Trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var idx=op.addOutPort(new CABLES.Port(op,"Index"));
var valX=op.addOutPort(new CABLES.Port(op,"Value 1"));
var valY=op.addOutPort(new CABLES.Port(op,"Value 2"));
var valZ=op.addOutPort(new CABLES.Port(op,"Value 3"));

exe.onTriggered=function()
{
    if(!arr.get())return;
    
    var ar=arr.get();
    for(var i=0;i<ar.length;i+=3)
    {
        if(i%mod.get()==0)
        {
            idx.set(i/3);
            valX.set(arr.val[i+0]);
            valY.set(arr.val[i+1]);
            valZ.set(arr.val[i+2]);
            trigger.trigger();

        }
    }
};
