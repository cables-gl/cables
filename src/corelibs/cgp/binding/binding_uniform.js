import { Binding } from "./binding.js";
import { CgpUniform } from "../cgp_uniform.js";
import { CgpGguBuffer } from "../cgp_gpubuffer.js";
import { CgpContext } from "../cgp_state.js";
import { CgpShader } from "../cgp_shader.js";

/** @extends Binding */
export class BindingUniform extends Binding
{

    /** @type {Array<CgpUniform>} */
    #uniforms = [];

    /** @type {Array<CgpGguBuffer>} */
    cgpBuffer = [];

    /**
     * Description
     * @param {CgpContext} cgp
     * @param {string} name
     * @param {object} options
     */
    constructor(cgp, name, options)
    {
        super(cgp, name, options);

        console.log("new binding uniform", this.id);
    }

    /**
     * @param {CgpShader} shader
     * @returns {Binding}
     */
    copy(shader)
    {
        const b = new BindingUniform(this.cgp, this.name, this.options);
        console.log("copybinuni", this.id, b.id);
        b.stage = this.stage;

        for (let i = 0; i < this.#uniforms.length; i++)
        {
            let foundWorldUni = false;
            for (let j = 0; j < shader.worldUniforms.length; j++)
            {
                if (shader.worldUniforms[j].getName() == this.#uniforms[i].getName())
                {
                    b.addUniform(shader.worldUniforms[j]);
                    foundWorldUni = true;
                }
            }
            if (!foundWorldUni) b.addUniform(this.#uniforms[i]);
        }

        return b;
    }

    /**
     * @param {CgpUniform} u
     */
    addUniform(u)
    {
        this.#uniforms.push(u);
        this.needsRebuildBindgroup = true;
        console.log(this.#uniforms, this);
        return u;
    }

    /**
     * @returns {GPUBindingResource}
     * @param {number} inst
     */
    getResource(inst)
    {
        this.updateBuffer(inst);
        return {
            "buffer": this.cgpBuffer[inst].gpuBuffer,
        };
    }

    getSizeBytes()
    {
        let size = 0;
        for (let i = 0; i < this.#uniforms.length; i++)
            size += this.#uniforms[i].getSizeBytes();

        return size;
    }

    /**
     * @param {string} name
     */
    getUniform(name)
    {
        for (let i = 0; i < this.#uniforms.length; i++)
        {
            if (this.#uniforms[i].name == name) return this.#uniforms[i];
        }
        return null;
    }

    /**
     * @param {string} name
     */
    removeUniformByName(name)
    {
        for (let i = 0; i < this.#uniforms.length; i++)
            if (this.#uniforms[i].name == name)
            {
                this.needsRebuildBindgroup = true;
                return this.#uniforms.splice(i, 1);
            }
    }

    /**
     * @param {number} inst
     */
    createBuffer(inst)
    {
        let buffCfg = {
            "label": this.name,
            "size": this.getSizeBytes(),
            "usage": GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        };

        this.cgpBuffer[inst] = new CgpGguBuffer(this.cgp, this.name + " buff", null, { "buffCfg": buffCfg });
    }

    pipelineUpdated()
    {
        this.needsRebuildBindgroup = false;
    }

    needsPipeUpdate()
    {
        return this.needsRebuildBindgroup;
    }

    /**
     * @param {number} inst
     */
    updateBuffer(inst)
    {
        let info = { "name": this.#uniforms.length + " uniforms", "stage ": CgpShader.getStageString(this.stage), "uniforms": [] };

        let s = this.getSizeBytes() / 4;
        info.s = this.getSizeBytes();
        if (s == 16)s = 16;
        if (!this.cgpBuffer[inst])
        {
            this.createBuffer(inst);
            // console.log("no cpubuff? ", s, this.#uniforms);
            // return;
        }
        this.cgpBuffer[inst].setLength(s);

        let off = 0;
        for (let i = 0; i < this.#uniforms.length; i++)
        {
            this.#uniforms[i].copyToBuffer(this.cgpBuffer[inst].floatArr, off);

            if (this.#uniforms[i].gpuBufferChanged)
                console.log("un changed", this.cgpBuffer[inst].floatArr);

            info.uniforms.push(this.#uniforms[i].getInfo());

            off += this.#uniforms[i].getSizeBytes() / 4;
        }
        if (this.cgp.branchProfiler) this.cgp.branchProfiler.push("binding update buff", CgpShader.getStageString(this.stage), { "info": info });

        this.cgpBuffer[inst].updateGpuBuffer();

        if (this.cgp.branchProfiler) this.cgp.branchProfiler.pop();
    }

    /**
     * @param {CgpShader} shader
     * @param {number} bindGroupNum
     */
    getShaderHeaderCode(shader, bindGroupNum)
    {
        this.cgp.profileData.count("shadercode uni", this.name);
        let str = "";
        let typeStr = "";
        let name = this.name;

        str += "//   [binding_uniform] - \"" + this.name + "\" " + this.id + " uniforms:" + this.#uniforms.length + "\n";

        if (!this.isActiveByDefine(shader))
        {
            str += "// " + typeStr + " " + this.name + ": excluded because define " + this.define + "\n";
            return str;
        }

        if (this.#uniforms.length > 1)
        {
            typeStr = "strct_" + name;

            str += "struct " + typeStr + "\n";
            str += "{\n";
            // if (this.#uniforms.length == 0) str += "placehoder:1.";
            // else
            for (let i = 0; i < this.#uniforms.length; i++)
            {
                str += "    " + this.#uniforms[i].name + ": " + this.#uniforms[i].getWgslTypeStr();
                if (i != this.#uniforms.length - 1)str += ",";
                str += "\n";
            }
            str += "};\n";

        }
        else if (this.#uniforms.length == 1)
        {
            typeStr = this.#uniforms[0].getWgslTypeStr();
            name = this.#uniforms[0].name;
        }
        else if (this.#uniforms.length == 0)
        {
            return str;
            // typeStr = "float";
            // name = "placeholder";
        }

        // console.log("shadercode uniforms", this.#uniforms[0].name);
        str += "@group(" + bindGroupNum + ") ";
        str += "@binding(" + this.bindNum + ") ";

        str += "var<uniform> ";
        str += name + ": " + typeStr + ";\n";

        // console.log(str);
        return str + "\n";
    }

    /** @returns {GPUBindGroupLayoutEntry} */
    getLayoutEntry()
    {
        return {
            "visibility": this.stage,
            "binding": this.bindNum,
            "minBindingSize": this.getSizeBytes(),
            "hasDynamicOffset": 0,
            "buffer": {}
        };
    }

    /**
     * @param {number} inst
     */
    updateValues(inst)
    {
        for (let i = 0; i < this.#uniforms.length; i++)
        {
            // if (this.#uniforms[i].needsUpdate)
        }
        return this.updateBuffer(inst);

    }

    getInfo()
    {
        const o = { "name": this.name, "id": this.id, "stage": this.stage, "class": this.constructor.name, "uniforms": [] };

        for (let i = 0; i < this.#uniforms.length; i++)
        {
            o.uniforms.push(this.#uniforms[i].getInfo());
        }
        return o;
    }
}
