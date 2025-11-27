import { Logger } from "cables-shared-client";
import { RenderPipeline } from "./cgp_renderpipeline.js";
import { CgMesh, Geometry } from "../cg/index.js";
import { CgpShader } from "./cgp_shader.js";

export class CgpMesh extends CgMesh
{
    #log = new Logger("cgl_mesh");

    /** @type {RenderPipeline} */
    #pipe = null;
    #geom = null;
    #numNonIndexed = 0;
    #positionBuffer = null;

    #numIndices = 0;
    needsPipelineUpdate = false;
    numIndex = 0;
    instances = 1;

    /** @type {{ buffer: any; }[]} */
    #attributes = [];

    /**
     * @param {any} _cgp
     * @param {any} __geom
     */
    constructor(_cgp, __geom)
    {
        super();

        this.cgp = _cgp;

        this.#pipe = new RenderPipeline(this.cgp, "pipe mesh " + __geom.name);

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
        this.#geom = geom;
        this.#disposeAttributes();

        this.#positionBuffer = this._createBuffer(this.cgp.device, new Float32Array(geom.vertices), GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);

        let vi = geom.verticesIndices;
        if (!geom.isIndexed()) vi = Array.from(Array(geom.vertices.length / 3).keys());
        this.#numIndices = vi.length;
        this._indicesBuffer = this._createBuffer(this.cgp.device, new Uint32Array(vi), GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST);

        if (geom.texCoords && geom.texCoords.length) this.setAttribute("texCoords", geom.texCoords, 2);
        if (geom.vertexNormals && geom.vertexNormals.length) this.setAttribute("normals", geom.vertexNormals, 3);

        this.setAttribute("normals", geom.vertexNormals, 3);
    }

    #disposeAttributes()
    {
        this.needsPipelineUpdate = true;
        for (let i = 0; i < this.#attributes.length; i++) this.#attributes[i].buffer.destroy();
        this.#attributes.length = 0;
    }

    dispose()
    {
        this.#pipe?.dispose();
        this.#pipe = null;
        this.#disposeAttributes();
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
        this.#attributes.push(attr);

        return attr;
    }

    /**
     * @param {CgpShader} shader
     */
    render(shader)
    {
        if (!this.#positionBuffer) return;
        if (this.instances <= 0) return;

        if (this.cgp.branchProfiler) this.cgp.branchProfiler.push("mesh.render()", "geom " + this.#geom.name);

        shader = shader || this.cgp.getShader();
        if (shader)shader.bind();

        if (!shader || !shader.isValid)
        {
            // this.status = "shader invalid";
            return;
        }

        this.#pipe.setName("mesh.render " + this.#geom.name + " " + shader.getName() + " " + shader.id);
        this.#pipe.setPipeline(shader, this);

        if (this.#pipe.isValid)
        {
            if (this.cgp.branchProfiler) this.cgp.branchProfiler.push("mesh.render().draw", "geom " + this.#geom.name, {
                "geom": this.#geom.getInfo(),
                "shader": shader.getInfo(),
                "numAttributes": this.#attributes.length
            });

            this.cgp.passEncoder.setVertexBuffer(0, this.#positionBuffer);
            for (let i = 0; i < this.#attributes.length; i++)
                this.cgp.passEncoder.setVertexBuffer(i + 1, this.#attributes[i].buffer);

            this.cgp.passEncoder.setIndexBuffer(this._indicesBuffer, "uint32");

            this.cgp.profileData.count("draw mesh", this._name);
            if (this.#numNonIndexed)
                this.cgp.passEncoder.draw(this.#numIndices, this.instances);
            else
                this.cgp.passEncoder.drawIndexed(this.#numIndices, this.instances);

            if (this.cgp.branchProfiler) this.cgp.branchProfiler.pop();
        }
        else
        {
            if (this.cgp.branchProfiler)
            {
                this.cgp.branchProfiler.push("mesh invalid pipeline ", "geom " + this.#geom.name);
                this.cgp.branchProfiler.pop();
            }
        }

        if (this.cgp.branchProfiler) this.cgp.branchProfiler.pop();

        // if (shader)shader.unbind();
    }
}
