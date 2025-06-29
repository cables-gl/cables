import { CgUniform } from "../cg/index.js";
import { CgpShader } from "./cgp_shader.js";
import { CgpContext } from "./cgp_state.js";

export class CgpUniform extends CgUniform
{

    /** @type {CgpContext} */
    #cgp = null;

    /** @type {GPUBuffer} */
    gpuBuffer = null;

    gpuBufferChanged = false;

    /**
     * Description
     * @param {CgpShader} __shader
     * @param {string} __type
     * @param {string} __name
     * @param {any} _value
     * @param {any} _port2
     * @param {any} _port3
     * @param {any} _port4
     */
    constructor(__shader, __type, __name, _value, _port2, _port3, _port4)
    {
        super(__shader, __type, __name, _value, _port2, _port3, _port4);
        this.#cgp = __shader._cgp;

        if (!_value || (_value.get && !_value.get()))
        {
            // if (this.getType() == "m4") this._value = mat4.create();
            if (this.getType() == "t")
            {
                this._value = this.#cgp.getEmptyTexture();
            }
            // else if (this.getType() == "2f") this._value = [0, 0];
            // else if (this.getType() == "4f") this._value = [0, 1, 0, 1];
            // else if (this.getType() == "3f") this._value = [0, 1, 0];
        }

    }

    getInfo()
    {
        return { "name": this.name, "type": this.type, "value": this.getValue() };
    }

    updateValueF() { }

    updateValueArrayF() {}

    setValueArrayF(v)
    {
        this.needsUpdate = true;
        this._value = v;
    }

    setValueF(v)
    {
        this.needsUpdate = true;
        this._value = v;
    }

    updateValue2F() { }

    setValue2F(v)
    {
        this.needsUpdate = true;
        this._value = v;
    }

    updateValue3F() { }

    setValue3F(v)
    {
        this.needsUpdate = true;
        this._value = v;
    }

    updateValue4F() { }

    setValue4F(v)
    {
        if (v[0] == undefined)
        {
            this._log.stack("uniform value undefined");
            console.error("uniform value undefined");
        }
        this.needsUpdate = true;
        this._value = v;
    }

    setValueT(v)
    {
        // if (this._value != v)
        //     this._shader.needsPipelineUpdate = "texture changed"; // todo really needed ? change binding instead?

        this.needsUpdate = true;
        this._value = v;
    }

    updateValueM4(v) {}

    setValueM4(v)
    {
        this.needsUpdate = true;
        this._value = v;
    }

    setValueAny(v)
    {
        this.needsUpdate = true;
        this._value = v;
    }

    updateValueAny() {}

    updateValueT() {}

    /**
     * @param {GPUBuffer} b
     */
    setGpuBuffer(b)
    {
        this.gpuBufferChanged = true;
        this.gpuBuffer = b;
    }

    copyToBuffer(buff, pos = 0)
    {
        if (this._type == "f")
        {
            buff[pos] = this._value;
        }
        else if (this._type == "t")
        {
        }
        else if (this._type == "4f")
        {
            buff[pos] = this._value[0];
            buff[pos + 1] = this._value[1];
            buff[pos + 2] = this._value[2];
            buff[pos + 3] = this._value[3];
        }
        else if (this._type == "2f")
        {
            buff[pos] = this._value[0];
            buff[pos + 1] = this._value[1];
        }
        else if (this._type == "3f")
        {
            buff[pos] = this._value[0];
            buff[pos + 1] = this._value[1];
            buff[pos + 2] = this._value[2];
        }
        else if (this._type == "f[]")
        {
            for (let i = 0; i < this._value.length; i++)
                buff[pos + i] = this._value[i];
        }
        else if (this._type == "m4")
        {
            for (let i = 0; i < 16; i++)
                buff[pos + i] = this._value[i];
        }
        else
        {
            this._log.warn("uniform copy to buffer unknown", this._type);
        }
    }

    getWgslTypeStr()
    {
        if (this._type == "m4") return "mat4x4f";
        if (this._type == "4f") return "vec4f";
        if (this._type == "3f") return "vec3f";
        if (this._type == "2f") return "vec2f";
        if (this._type == "f") return "f32";
        if (this._type == "f[]") return "array<vec4f>";
        if (this._type == "i") return "int";
        if (this._type == "sampler") return "sampler";
        if (this._type == "t") return "texture_2d<f32>";
        this._log.warn("unknown type getWgslTypeStr", this._type);
        return "???";
    }

    getSizeBytes()
    {
        const bytesPerFloat = 4;
        const bytesPerInt = 4;
        if (this._type == "t") return 4;
        if (this._type == "sampler") return 4;
        if (this._type == "f") return 1 * bytesPerFloat;
        if (this._type == "2f") return 2 * bytesPerFloat;
        if (this._type == "3f") return 3 * bytesPerFloat;
        if (this._type == "4f") return 4 * bytesPerFloat;
        if (this._type == "f[]") return this._value.length * bytesPerFloat;
        if (this._type == "m4") return 4 * 4 * bytesPerFloat;
        if (this._type == "i") return 1 * bytesPerInt;
        if (this._type == "2i") return 2 * bytesPerInt;

        this._log.warn("unknown type getSizeBytes", this._type);
        return 4;
    }

    /**
     * @param {CgpShader} shader
     */
    copy(shader)
    {
        const uni = new CgpUniform(shader, this._type, this._name, this._value, this._port2, this._port3, this._port4);
        uni.shaderType = this.shaderType;

        // console.log(this._name, this._value, uni._value);

        return uni;
    }

}
