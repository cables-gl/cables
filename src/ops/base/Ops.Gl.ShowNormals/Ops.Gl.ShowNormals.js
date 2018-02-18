
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var geometry=op.addInPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));

var mul=op.addInPort(new Port(op,"Length",OP_PORT_TYPE_VALUE));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

mul.set(0.1);

geometry.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var buffer = cgl.gl.createBuffer();

geometry.onChange=rebuild;
mul.onChange=rebuild;

function rebuild()
{
    var points=[];
    var segments=4;
    var i=0;
    var geom=geometry.get();

    if(geom)
    {
        for(i=0;i<geom.vertices.length;i+=3)
        {
            points.push(geom.vertices[i+0]);
            points.push(geom.vertices[i+1]);
            points.push(geom.vertices[i+2]);
    
            points.push(geom.vertices[i+0]+geom.vertexNormals[i+0]*mul.get());
            points.push(geom.vertices[i+1]+geom.vertexNormals[i+1]*mul.get());
            points.push(geom.vertices[i+2]+geom.vertexNormals[i+2]*mul.get());
        }
    }

    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(points), cgl.gl.STATIC_DRAW);
    buffer.itemSize = 3;
    buffer.numItems = points.length/buffer.itemSize;
}

render.onTriggered=function()
{
    if(geometry.get())
    {
        var shader=cgl.getShader();
        if(!shader)return;
    
        cgl.pushModelMatrix();
    
        shader.bind();
        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    
        cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(),buffer.itemSize, cgl.gl.FLOAT, false, 0, 0);
        cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());
    
        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
        cgl.gl.drawArrays(cgl.gl.LINES, 0, buffer.numItems);
    
        cgl.popModelMatrix();
        trigger.trigger();

    }
};

