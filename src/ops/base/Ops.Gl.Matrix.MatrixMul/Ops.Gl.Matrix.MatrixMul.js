const render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
const trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));
const matrix=op.addInPort(new CABLES.Port(op,"matrix"),CABLES.OP_PORT_TYPE_ARRAY);

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
