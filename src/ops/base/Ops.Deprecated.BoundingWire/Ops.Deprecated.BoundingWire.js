op.name="BoundingWire";
var cgl=op.patch.cgl;

var buffer = cgl.gl.createBuffer();

var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));

function doRender()
{
    var shader=cgl.getShader();
    if(!shader)return;

    cgl.pushModelMatrix();

    shader.bind();
    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);

    cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(),buffer.itemSize, cgl.gl.FLOAT, false, 0, 0);
    cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());

    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    cgl.gl.drawArrays(cgl.gl.LINE_STRIP, 0, buffer.numItems);

    cgl.popModelMatrix();
    trigger.trigger();
}

function bufferData()
{
    var points=[];
    var segments=4;
    var i=0,degInRad=0;
    var radius=0.5;

    for (i=0; i <= Math.round(segments); i++)
    {
        degInRad = (360.0/Math.round(segments))*i*CGL.DEG2RAD;
        points.push(Math.cos(degInRad)*radius);
        points.push(0);
        points.push(Math.sin(degInRad)*radius);
    }

    for (i=0; i <= Math.round(segments); i++)
    {
        degInRad = (360.0/Math.round(segments))*i*CGL.DEG2RAD;
        points.push(Math.cos(degInRad)*radius);
        points.push(Math.sin(degInRad)*radius);
        points.push(0);
    }
 
    for (i=0; i <= Math.round(segments); i++)
    {
        degInRad = (360.0/Math.round(segments))*i*CGL.DEG2RAD;
        points.push(0);
        points.push(Math.cos(degInRad)*radius);
        points.push(Math.sin(degInRad)*radius);
    }

    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(points), cgl.gl.STATIC_DRAW);
    buffer.itemSize = 3;
    buffer.numItems = points.length/buffer.itemSize;
}

bufferData();

render.onTriggered=doRender;
