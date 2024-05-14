// import { vec3, mat4 } from "gl-matrix";
import { Geometry } from "../cg/cg_geom.js";
import { Mesh } from "./cgl_mesh.js";
import { Shader } from "./cgl_shader.js";
import { DEG2RAD } from "./cgl_utils.js";


export const Marker = function (_cgl) // deprecated...
{
    this.draw = function (cgl, _size, depthTest) {};
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

        const shader = _cgl.getShader();

        if (shader)
        {
            shader.bind();
            _cgl.gl.bindBuffer(_cgl.gl.ARRAY_BUFFER, buffer);

            _cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(), buffer.itemSize, _cgl.gl.FLOAT, false, 0, 0);
            _cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());

            _cgl.gl.bindBuffer(_cgl.gl.ARRAY_BUFFER, buffer);
            _cgl.gl.drawArrays(_cgl.gl.LINE_STRIP, 0, buffer.numItems);
        }

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
        if (shader)
        {
            shader.bind();
            _cgl.gl.bindBuffer(_cgl.gl.ARRAY_BUFFER, buffer);

            _cgl.gl.vertexAttribPointer(shader.getAttrVertexPos(), buffer.itemSize, _cgl.gl.FLOAT, false, 0, 0);
            _cgl.gl.enableVertexAttribArray(shader.getAttrVertexPos());

            _cgl.gl.bindBuffer(_cgl.gl.ARRAY_BUFFER, buffer);
            _cgl.gl.drawArrays(_cgl.gl.LINE_STRIP, 0, buffer.numItems);
        }

        _cgl.popModelMatrix();
    };

    bufferData();
};
