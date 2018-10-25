
var exe=this.addInPort(new CABLES.Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
// var arrayIn=this.addInPort(new CABLES.Port(this,"array",CABLES.OP_PORT_TYPE_ARRAY));
var arrayIn=this.addInPort(new CABLES.Port(this,"array",CABLES.OP_PORT_TYPE_ARRAY));

var trigger=this.addOutPort(new CABLES.Port(this,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var idx=this.addOutPort(new CABLES.Port(this,"index"));

var vec=vec3.create();
var cgl=this.patch.cgl;
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