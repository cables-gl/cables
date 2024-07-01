op.name = "Plotter";
let render = op.inTrigger("render");
let v = op.addInPort(new CABLES.Port(op, "value"));
let trigger = op.outTrigger("trigger");

let cgl = op.patch.cgl;
let buffer = cgl.gl.createBuffer();
let num = 50;
let vertices = [];

for (let i = 0; i < num; i++)
{
    vertices.push(1 / num * i);
    vertices.push(Math.random() - 0.5);
    vertices.push(0);
}
bufferData();

render.onTriggered = function ()
{
    cgl.getShader().bind();
    cgl.gl.enableVertexAttribArray(cgl.getShader().getAttrVertexPos());
    cgl.gl.vertexAttribPointer(cgl.getShader().getAttrVertexPos(), buffer.itemSize, cgl.gl.FLOAT, false, 0, 0);
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

v.onChange = function ()
{
    vertices.splice(0, 3);
    vertices.push(1);
    vertices.push(v.get());
    vertices.push(0);

    for (let i = 0; i < num * 3; i += 3)
    {
        vertices[i] = 1 / num * i;
    }

    bufferData();
};
