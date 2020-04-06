var cgl=op.patch.cgl;
var render=op.inTrigger('render');
var inIdentity=op.inValueBool("Identity",false);
var next=op.outTrigger("trigger");

var m=mat4.create();
var matrix=op.inArray("matrix");

render.onTriggered=function()
{
    cgl.pushModelMatrix();

    if(inIdentity.get()) mat4.identity(cgl.mMatrix);

    mat4.multiply(cgl.mMatrix,cgl.mMatrix,matrix.get());

    next.trigger();
    cgl.popModelMatrix();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
