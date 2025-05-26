import { Logger } from "cables-shared-client";
import { RenderPipeline } from "./cgp_renderpipeline.js";
import { CgMesh, Geometry } from "../cg/index.js";
import { CgpShader } from "./cgp_shader.js";

export class CgpMesh extends CgMesh
{
    #log = new Logger("cgl_mesh");
    needsPipelineUpdate = false;

    /**
     * @param {any} _cgp
     * @param {any} __geom
     */
    constructor(_cgp, __geom)
    {
        super();

        this.cgp = _cgp;
        this._geom = null;
        this.numIndex = 0;
        this.instances = 1;

        this._pipe = new RenderPipeline(this.cgp, "pipe mesh " + __geom.name);
        this._numNonIndexed = 0;
        this._positionBuffer = null;

        this._attributes = [];

        if (__geom) this.setGeom(__geom);
    }

    /**
     * @param {GPUDevice} device
     * @param {any} data
     * @param {any} usage
     */
    _createBuffer(device, data, usage)
    {
        let bo = {
            "size": data.byteLength,
            "usage": usage,
            "mappedAtCreation": true,
        };
        const buffer = device.createBuffer(bo);
        const dst = new data.constructor(buffer.getMappedRange());
        dst.set(data);
        buffer.unmap();
        return buffer;
    }

    /**
     * @function setGeom
     * @memberof Mesh
     * @instance
     * @description set geometry for mesh
     * @param {Geometry} geom geometry
     */
    setGeom(geom)
    {
        this.needsPipelineUpdate = true;
        this._geom = geom;
        this._disposeAttributes();

        this._positionBuffer = this._createBuffer(this.cgp.device, new Float32Array(geom.vertices), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);

        let vi = geom.verticesIndices;
        if (!geom.isIndexed()) vi = Array.from(Array(geom.vertices.length / 3).keys());
        this._numIndices = vi.length;
        this._indicesBuffer = this._createBuffer(this.cgp.device, new Uint32Array(vi), GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);

        if (geom.texCoords && geom.texCoords.length) this.setAttribute("texCoords", geom.texCoords, 2);
        if (geom.vertexNormals && geom.vertexNormals.length) this.setAttribute("normals", geom.vertexNormals, 3);

        this.setAttribute("normals", geom.vertexNormals, 3);
    }

    _disposeAttributes()
    {
        this.needsPipelineUpdate = true;
        for (let i = 0; i < this._attributes.length; i++) this._attributes[i].buffer.destroy();
        this._attributes.length = 0;
    }

    dispose()
    {
        this._disposeAttributes();
    }

    /**
     * @function setAttribute
     * @description update attribute
     * @memberof Mesh
     * @instance
     * @param {String} name attribute name
     * @param {Array} array data
     * @param {Number} itemSize
     * @param {Object} options
     */
    setAttribute(name, array, itemSize, options = {})
    {
        if (!array)
        {
            this.#log.error("mesh addAttribute - no array given! " + name);
            throw new Error();
        }

        let instanced = false;
        if (options.instanced) instanced = options.instanced;

        const buffer = this._createBuffer(this.cgp.device, new Float32Array(array), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);

        const attr = {
            "buffer": buffer,
            "name": name,
            "instanced": instanced,
        };
        this._attributes.push(attr);

        return attr;
    }

    /**
     * @param {CgpShader} shader
     */
    render(shader)
    {
        if (!this._positionBuffer) return;
        if (this.instances <= 0) return;

        if (this.cgp.branchProfiler) this.cgp.branchProfiler.push("mesh.render()", "geom " + this._geom.name);

        shader = shader || this.cgp.getShader();
        if (shader)shader.bind();

        if (!shader || !shader.isValid)
        {
            // this.status = "shader invalid";
            return;
        }

        this._pipe.setName("mesh.render " + this._geom.name + " " + shader.getName() + " " + shader.id);
        this._pipe.setPipeline(shader, this);

        if (this._pipe.isValid)
        {
            if (this.cgp.branchProfiler) this.cgp.branchProfiler.push("mesh.render().draw", "geom " + this._geom.name, {
                "geom": this._geom.getInfo(),
                "shader": shader.getInfo(),
                "numAttributes": this._attributes.length
            });

            this.cgp.passEncoder.setVertexBuffer(0, this._positionBuffer);
            for (let i = 0; i < this._attributes.length; i++)
                this.cgp.passEncoder.setVertexBuffer(i + 1, this._attributes[i].buffer);

            this.cgp.passEncoder.setIndexBuffer(this._indicesBuffer, "uint32");

            this.cgp.profileData.count("draw mesh", this._name);
            if (this._numNonIndexed)
                this.cgp.passEncoder.draw(this._numIndices, this.instances);
            else
                this.cgp.passEncoder.drawIndexed(this._numIndices, this.instances);

            if (this.cgp.branchProfiler) this.cgp.branchProfiler.pop();
        }
        else
        {
            if (this.cgp.branchProfiler)
            {
                this.cgp.branchProfiler.push("mesh invalid pipeline ", "geom " + this._geom.name);
                this.cgp.branchProfiler.pop();
            }
        }

        if (this.cgp.branchProfiler) this.cgp.branchProfiler.pop();

        // if (shader)shader.unbind();
    }
}
