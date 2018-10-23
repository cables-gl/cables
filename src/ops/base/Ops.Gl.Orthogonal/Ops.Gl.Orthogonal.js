op.name='Orthogonal';

var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
var boundsLeft=op.addInPort(new Port(op,"left",CABLES.OP_PORT_TYPE_VALUE ));
var boundsRight=op.addInPort(new Port(op,"right",CABLES.OP_PORT_TYPE_VALUE ));
var boundsBottom=op.addInPort(new Port(op,"bottom",CABLES.OP_PORT_TYPE_VALUE ));
var boundsTop=op.addInPort(new Port(op,"top",CABLES.OP_PORT_TYPE_VALUE ));
var zNear=op.addInPort(new Port(op,"frustum near",CABLES.OP_PORT_TYPE_VALUE ));
var zFar=op.addInPort(new Port(op,"frustum far",CABLES.OP_PORT_TYPE_VALUE ));

boundsLeft.set(-1);
boundsRight.set(1);
boundsBottom.set(-1);
boundsTop.set(1);
zNear.set(0.01);
zFar.set(2000.0);

var cgl=op.patch.cgl;

render.onTriggered=function()
{
    var ratio=1;

    cgl.pushPMatrix();
    mat4.ortho(cgl.pMatrix, 
        boundsLeft.get()*ratio, 
        boundsRight.get()*ratio,  
        boundsBottom.get()*ratio, 
        boundsTop.get()*ratio, 
        parseFloat(zNear.get()), 
        parseFloat(zFar.get())
        );

    trigger.trigger();
    cgl.popPMatrix();
};
