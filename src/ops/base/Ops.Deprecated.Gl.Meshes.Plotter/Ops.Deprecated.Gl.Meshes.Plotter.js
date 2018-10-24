
op.name='Plotter';
var render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var v=op.addInPort(new CABLES.Port(op,"value"));
var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;
var buffer = cgl.gl.createBuffer();
var num=50;
var vertices = [];

for(var i=0;i<num;i++)
{
    vertices.push(1/num*i);
    vertices.push(Math.random()-0.5);
    vertices.push(0);
}
bufferData();

render.onTriggered=function()
{
    cgl.getShader().bind();
    cgl.gl.enableVertexAttribArray(cgl.getShader().getAttrVertexPos());
    cgl.gl.vertexAttribPointer(cgl.getShader().getAttrVertexPos(),buffer.itemSize, cgl.gl.FLOAT, false, 0, 0);
    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    cgl.gl.drawArrays(cgl.gl.LINE_STRIP, 0, buffer.numItems);

    trigger.trigger();
};



function bufferData()
{
    cgl.gl.lineWidth(4);

    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(vertices), cgl.gl.STATIC_DRAW);
    buffer.itemSize = 3;
    buffer.numItems = num;
}


v.onValueChanged=function()
{
    vertices.splice(0,3);
    vertices.push(1);
    vertices.push(v.get());
    vertices.push(0);

    for(var i=0;i<num*3;i+=3)
    {
        vertices[i]=1/num*i;
    }

    bufferData();
};
