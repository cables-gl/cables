// import { vec3, mat4 } from "gl-matrix";
import { Geometry } from "./cgl_geom";
import { Mesh } from "./cgl_mesh";
import { Shader } from "./cgl_shader";
import { DEG2RAD } from "./cgl_utils";


// TODO CAN THIS BE REMOVED ?


export const Marker=function(cgl)
{
    var geom=new Geometry("marker");
    geom.setPointVertices(
        [
            0.00001, 0, 0,   1,0,0,
            0, 0.00001, 0,   0,1,0,
            0, 0, 0.00001,   0,0,1,
        ]);
    var mesh=new Mesh(cgl, geom, cgl.gl.LINES);
    mesh.setGeom(geom);

    var shader=new Shader(cgl,'markermaterial');

    var frag=''
        .endl()+'precision highp float;'
        .endl()+'IN vec3 axisColor;'

        .endl()+'void main()'
        .endl()+'{'
        .endl()+'    vec4 col=vec4(axisColor,1.0);'
        .endl()+'    outColor = col;'
        .endl()+'}';

    var vert=''
        .endl()+'IN vec3 vPosition;'
        .endl()+'UNI mat4 projMatrix;'
        .endl()+'UNI mat4 mvMatrix;'
        .endl()+'OUT vec3 axisColor;'

        .endl()+'void main()'
        .endl()+'{'
        .endl()+'   vec4 pos=vec4(vPosition, 1.0);'
        .endl()+'   if(pos.x!=0.0)axisColor=vec3(1.0,0.3,0.0);'
        .endl()+'   if(pos.y!=0.0)axisColor=vec3(0.0,1.0,0.2);'
        .endl()+'   if(pos.z!=0.0)axisColor=vec3(0.0,0.5,1.0);'

        .endl()+'   gl_Position = projMatrix * mvMatrix * pos;'
        .endl()+'}';

    shader.setSource(vert,frag);

    this._vScale=vec3.create();

    this.draw=function(cgl)
    {
        var size=2;
        cgl.pushModelMatrix();



        cgl.setShader(shader);




        vec3.set(this._vScale, size,size,size);
        mat4.scale(cgl.mvMatrix,cgl.mvMatrix, this._vScale);

        // cgl.gl.disable(cgl.gl.DEPTH_TEST);
        cgl.pushDepthTest(false);

        mesh.render(cgl.getShader());

        // cgl.gl.enable(cgl.gl.DEPTH_TEST);
        cgl.popDepthTest();

        cgl.setPreviousShader();


        cgl.popModelMatrix();
    };
};









export const WirePoint=function(cgl,size)
{
    var buffer = cgl.gl.createBuffer();
    var vScale=vec3.create();

    function bufferData()
    {
        var points=[];
        var segments=24;
        var i=0,degInRad=0;
        var radius=0.5;

        for (i=0; i <= Math.round(segments); i++)
        {
            degInRad = (360.0/Math.round(segments))*i*DEG2RAD;
            points.push(Math.cos(degInRad)*radius);
            points.push(0);
            points.push(Math.sin(degInRad)*radius);
        }

        for (i=0; i <= Math.round(segments); i++)
        {
            degInRad = (360.0/Math.round(segments))*i*DEG2RAD;
            points.push(Math.cos(degInRad)*radius);
            points.push(Math.sin(degInRad)*radius);
            points.push(0);
        }

        for (i=0; i <= Math.round(segments); i++)
        {
            degInRad = (360.0/Math.round(segments))*i*DEG2RAD;
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
        cgl.pushModelMatrix();

        vec3.set(vScale, size,size,size);
        mat4.scale(cgl.mvMatrix,cgl.mvMatrix, vScale);

        // var shader=cgl.getDefaultShader();
        var shader=cgl.getShader();

        shader.bind();
        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);

        cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(),buffer.itemSize, cgl.gl.FLOAT, false, 0, 0);
        cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());

        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
        cgl.gl.drawArrays(cgl.gl.LINE_STRIP, 0, buffer.numItems);

        cgl.popModelMatrix();
    };

    bufferData();

};


export const WireCube=function(cgl)
{
    var buffer = cgl.gl.createBuffer();
    var vScale=vec3.create();

    function bufferData()
    {
        var points=[];
        var tc=[];
        var norms=[];
        var segments=24;
        var i=0,degInRad=0;
        var radius=0.5;

        points.push(-1,-1, 1);
        points.push( 1,-1, 1);
        points.push( 1, 1, 1);
        points.push(-1, 1, 1);
        points.push(-1,-1, 1);

        points.push(-1,-1,-1);
        points.push( 1,-1,-1);
        points.push( 1, 1,-1);
        points.push(-1, 1,-1);
        points.push(-1,-1,-1);

        points.push(-1,-1,-1);
        points.push(-1, 1,-1);
        points.push(-1, 1, 1);
        points.push(-1,-1, 1);
        points.push(-1,-1,-1);

        points.push(1,-1,-1);
        points.push(1, 1,-1);
        points.push(1, 1, 1);
        points.push(1,-1, 1);
        points.push(1,-1,-1);


        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
        cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(points), cgl.gl.STATIC_DRAW);
        buffer.itemSize = 3;
        buffer.numItems = points.length/buffer.itemSize;
    }


    this.render=function(cgl,sizeX,sizeY,sizeZ)
    {
        cgl.pushModelMatrix();

        vec3.set(vScale, sizeX||1,sizeY||1,sizeZ||1);
        mat4.scale(cgl.mvMatrix,cgl.mvMatrix, vScale);

        var shader=cgl.getShader();
        shader.bind();
        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);

        cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(),buffer.itemSize, cgl.gl.FLOAT, false, 0, 0);
        cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());

        // cgl.gl.disableVertexAttribArray(1);

        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
        cgl.gl.drawArrays(cgl.gl.LINE_STRIP, 0, buffer.numItems);

        cgl.popModelMatrix();

    };

    bufferData();

};

