// import { vec3, mat4 } from "gl-matrix";
import { Geometry } from "./cgl_geom";
import { Mesh } from "./cgl_mesh";
import { Shader } from "./cgl_shader";
import { DEG2RAD } from "./cgl_utils";


export const Marker = function (_cgl)
{
    const geom = new Geometry("marker");
    geom.setPointVertices(
        [
            0.00001, 0, 0, 1, 0, 0,
            0, 0.00001, 0, 0, 1, 0,
            0, 0, 0.00001, 0, 0, 1,
        ]
    );
    const mesh = new Mesh(_cgl, geom, _cgl.gl.LINES);
    mesh.setGeom(geom);

    const shader = new Shader(_cgl, "markermaterial");

    const frag = ""
        .endl() + "precision highp float;"
        .endl() + "IN vec3 axisColor;"

        .endl() + "void main()"
        .endl() + "{"
        .endl() + "    vec4 col=vec4(axisColor,1.0);"
        .endl() + "    outColor = col;"
        .endl() + "}";

    const vert = ""
        .endl() + "IN vec3 vPosition;"
        .endl() + "UNI mat4 projMatrix;"
        .endl() + "UNI mat4 mvMatrix;"
        .endl() + "OUT vec3 axisColor;"

        .endl() + "void main()"
        .endl() + "{"
        .endl() + "   vec4 pos=vec4(vPosition, 1.0);"
        .endl() + "   if(pos.x!=0.0)axisColor=vec3(1.0,0.3,0.0);"
        .endl() + "   if(pos.y!=0.0)axisColor=vec3(0.0,1.0,0.2);"
        .endl() + "   if(pos.z!=0.0)axisColor=vec3(0.0,0.5,1.0);"

        .endl() + "   gl_Position = projMatrix * mvMatrix * pos;"
        .endl() + "}";

    shader.setSource(vert, frag);

    this._vScale = vec3.create();

    this.draw = function (cgl, _size, depthTest)
    {
        const size = _size || 2;
        cgl.pushModelMatrix();

        cgl.pushShader(shader);

        vec3.set(this._vScale, size, size, size);
        mat4.scale(cgl.mvMatrix, cgl.mvMatrix, this._vScale);

        // cgl.gl.disable(cgl.gl.DEPTH_TEST);
        cgl.pushDepthTest(depthTest == true);

        mesh.render(cgl.getShader());

        // cgl.gl.enable(cgl.gl.DEPTH_TEST);
        cgl.popDepthTest();

        cgl.popShader();


        cgl.popModelMatrix();
    };
};


export const WirePoint = function (cgl)
{
    const buffer = cgl.gl.createBuffer();
    const vScale = vec3.create();

    function bufferData()
    {
        const points = [];
        const segments = 24;
        let i = 0, degInRad = 0;
        const radius = 0.5;

        for (i = 0; i <= Math.round(segments); i++)
        {
            degInRad = (360.0 / Math.round(segments)) * i * DEG2RAD;
            points.push(Math.cos(degInRad) * radius);
            points.push(0);
            points.push(Math.sin(degInRad) * radius);
        }

        for (i = 0; i <= Math.round(segments); i++)
        {
            degInRad = (360.0 / Math.round(segments)) * i * DEG2RAD;
            points.push(Math.cos(degInRad) * radius);
            points.push(Math.sin(degInRad) * radius);
            points.push(0);
        }

        for (i = 0; i <= Math.round(segments); i++)
        {
            degInRad = (360.0 / Math.round(segments)) * i * DEG2RAD;
            points.push(0);
            points.push(Math.cos(degInRad) * radius);
            points.push(Math.sin(degInRad) * radius);
        }

        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
        cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(points), cgl.gl.STATIC_DRAW);
        buffer.itemSize = 3;
        buffer.numItems = points.length / buffer.itemSize;
    }


    this.render = function (_cgl, _size)
    {
        _cgl.pushModelMatrix();

        vec3.set(vScale, _size, _size, _size);
        mat4.scale(_cgl.mvMatrix, _cgl.mvMatrix, vScale);

        // var shader=cgl.getDefaultShader();
        const shader = _cgl.getShader();

        shader.bind();
        _cgl.gl.bindBuffer(_cgl.gl.ARRAY_BUFFER, buffer);

        _cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(), buffer.itemSize, _cgl.gl.FLOAT, false, 0, 0);
        _cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());

        _cgl.gl.bindBuffer(_cgl.gl.ARRAY_BUFFER, buffer);
        _cgl.gl.drawArrays(_cgl.gl.LINE_STRIP, 0, buffer.numItems);

        _cgl.popModelMatrix();
    };

    bufferData();
};


export const WireCube = function (cgl)
{
    const buffer = cgl.gl.createBuffer();
    const vScale = vec3.create();

    function bufferData()
    {
        const points = [];
        const tc = [];
        const norms = [];
        const segments = 24;
        const radius = 0.5;

        points.push(-1, -1, 1);
        points.push(1, -1, 1);
        points.push(1, 1, 1);
        points.push(-1, 1, 1);
        points.push(-1, -1, 1);

        points.push(-1, -1, -1);
        points.push(1, -1, -1);
        points.push(1, 1, -1);
        points.push(-1, 1, -1);
        points.push(-1, -1, -1);

        points.push(-1, -1, -1);
        points.push(-1, 1, -1);
        points.push(-1, 1, 1);
        points.push(-1, -1, 1);
        points.push(-1, -1, -1);

        points.push(1, -1, -1);
        points.push(1, 1, -1);
        points.push(1, 1, 1);
        points.push(1, -1, 1);
        points.push(1, -1, -1);

        cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
        cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(points), cgl.gl.STATIC_DRAW);
        buffer.itemSize = 3;
        buffer.numItems = points.length / buffer.itemSize;
    }

    this.render = function (_cgl, sizeX, sizeY, sizeZ)
    {
        _cgl.pushModelMatrix();

        vec3.set(vScale, sizeX || 1, sizeY || 1, sizeZ || 1);
        mat4.scale(_cgl.mvMatrix, _cgl.mvMatrix, vScale);

        const shader = _cgl.getShader();
        shader.bind();
        _cgl.gl.bindBuffer(_cgl.gl.ARRAY_BUFFER, buffer);

        _cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(), buffer.itemSize, _cgl.gl.FLOAT, false, 0, 0);
        _cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());

        _cgl.gl.bindBuffer(_cgl.gl.ARRAY_BUFFER, buffer);
        _cgl.gl.drawArrays(_cgl.gl.LINE_STRIP, 0, buffer.numItems);

        _cgl.popModelMatrix();
    };

    bufferData();
};
