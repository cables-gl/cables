const render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
const trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
const matrix=op.addInPort(new Port(op,"matrix"),OP_PORT_TYPE_ARRAY);

const cgl=op.patch.cgl;
var m=mat4.create();

matrix.onChange=function()
{
    m.set(matrix.get());
};

render.onTriggered=function()
{
    cgl.pushModelMatrix();
    mat4.multiply(cgl.mMatrix,cgl.mMatrix,m);
    trigger.trigger();
    cgl.popModelMatrix();
};

matrix.set( [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] );
