var cgl=this.patch.cgl;
this.name='clonedmesh';

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var transformations=this.addInPort(new Port(this,"transformations",OP_PORT_TYPE_VALUE));

render.onTriggered=function()
{
    // console.log(transformations.get());
    
    for(var i=0;i<transformations.get().length;i++)
    {
        cgl.pushMvMatrix();
        mat4.multiply( cgl.mvMatrix,cgl.mvMatrix,transformations.get()[i] );
    
        trigger.trigger();
        cgl.popMvMatrix();
        
    }
};

