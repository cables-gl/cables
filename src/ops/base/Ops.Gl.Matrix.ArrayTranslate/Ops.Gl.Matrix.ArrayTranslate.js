var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var arrayIn=op.addInPort(new CABLES.Port(op,"array",CABLES.OP_PORT_TYPE_ARRAY));

var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var idx=op.addOutPort(new CABLES.Port(op,"index"));

var vec=vec3.create();
const cgl=this.patch.cgl;
function render()
{

    if(!arrayIn.get())return;
    var arr=arrayIn.val;

    for(var i=0;i<arr.length;i+=3)
    {
        vec3.set(vec, arr[i],arr[i+1],arr[i+2]);
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
        trigger.trigger();
        cgl.popModelMatrix();
    }
}

exe.onTriggered=render;