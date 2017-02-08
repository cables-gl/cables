CABLES=CABLES||{};
CABLES.WebAudio = CABLES.WebAudio || {};


CGL.Marker=function(cgl)
{

    var geom=new CGL.Geometry("marker");
    geom.setPointVertices(
        [
            0, 0, 0,   1,0,0,
            0, 0, 0,   0,1,0,
            0, 0, 0,   0,0,1,
        ]);
    var mesh=new CGL.Mesh(cgl, geom, cgl.gl.LINES);
    mesh.setGeom(geom);


    var shader=new CGL.Shader(cgl,'markermaterial');

    var frag=''
        .endl()+'precision highp float;'
        .endl()+'void main()'
        .endl()+'{'
        .endl()+'    vec4 col=vec4(0.0,1.0,1.0,1.0);'
        .endl()+'    gl_FragColor = col;'
        .endl()+'}';

    var vert=''
        .endl()+'attribute vec3 vPosition;'
        .endl()+'uniform mat4 projMatrix;'
        .endl()+'uniform mat4 mvMatrix;'

        .endl()+'void main()'
        .endl()+'{'
        .endl()+'   vec4 pos=vec4(vPosition,  1.0);'
        .endl()+'   gl_Position = projMatrix * mvMatrix * pos;'
        .endl()+'}';


    shader.setSource(vert,frag);


    this.draw=function(cgl)
    {
        var size=2;
        cgl.pushMvMatrix();


        cgl.setShader(shader);




        vec3.set(vScale, size,size,size);
        mat4.scale(cgl.mvMatrix,cgl.mvMatrix, vScale);

        cgl.gl.disable(cgl.gl.DEPTH_TEST);

        mesh.render(cgl.getShader());

        cgl.gl.enable(cgl.gl.DEPTH_TEST);

        cgl.setPreviousShader();


        cgl.popMvMatrix();
    };
};








// remove this!!!

CGL.WirePoint=function(cgl,size)
{
    var buffer = cgl.gl.createBuffer();

    function bufferData()
    {
        var points=[];
        var segments=24;
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


    this.render=function(cgl,size)
    {
        cgl.pushMvMatrix();

        vec3.set(vScale, size,size,size);
        mat4.scale(cgl.mvMatrix,cgl.mvMatrix, vScale);

        var shader=cgl.getDefaultShader();
        shader.bind();
        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);

        cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(),buffer.itemSize, cgl.gl.FLOAT, false, 0, 0);
        cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());

        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
        cgl.gl.drawArrays(cgl.gl.LINE_STRIP, 0, buffer.numItems);

        cgl.popMvMatrix();

    };

    bufferData();

};
