// Op.apply(this, arguments);
// var self=this;
var cgl=this.patch.cgl;
this.name='MercatorCoordTransform';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var arr=this.addInPort(new Port(this,"array",OP_PORT_TYPE_ARRAY));


var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var vec=vec3.create();
var vecMin=vec3.create();

exe.onTriggered=function()
{
    if(!arr.val)return;
    var theArray=arr.get();
    
    
    cgl.pushMvMatrix();

    for(var i in theArray)
    {
        var x=theArray[i].lon;
        var y=theArray[i].lat;
        vec3.set(vec,x,y,0);
        vec3.set(vecMin,-1*x,-1*y,0);
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
        trigger.trigger();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vecMin);
    }
    cgl.popMvMatrix();


    
};
