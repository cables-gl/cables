import CgTexture from "../cg/cg_texture.js";
import CgUniform from "../cg/cg_uniform.js";

export default class Uniform extends CgUniform
{
    constructor(__shader, __type, __name, _value, _port2, _port3, _port4, _structUniformName, _structName, _propertyName)
    {
        super(__shader, __type, __name, _value, _port2, _port3, _port4, _structUniformName, _structName, _propertyName);
        this._cgp = __shader._cgp;




        // if (!CABLES.emptyCglTexture)
        // {
        //     let size = 256;

        //     CABLES.emptyCglTexture = this._cgp.device.createTexture(
        //         {
        //             "size": [size, size],
        //             "format": "rgba8unorm",
        //             "usage": GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        //         });
        //     const data = CgTexture.getDefaultTextureData("stripes", size);

        //     this._cgp.device.queue.writeTexture(
        //         { "texture": CABLES.emptyCglTexture },
        //         data,
        //         { "bytesPerRow": size * 4 },
        //         { "width": size, "height": size },
        //     );


        //     /// ////////////


        //     CABLES.errorTexture = this._cgp.device.createTexture(
        //         {
        //             "size": [size, size],
        //             "format": "rgba8unorm",
        //             "usage": GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        //         });
        //     const data2 = CgTexture.getDefaultTextureData("stripes", size, { "r": 55, "g": 0, "b": 0 });

        //     this._cgp.device.queue.writeTexture(
        //         { "texture": CABLES.errorTexture },
        //         data2,
        //         { "bytesPerRow": size * 4 },
        //         { "width": size, "height": size },
        //     );
        // }

        if (this.getType() == "t" && !_value) this._value = this._cgp.getEmptyTexture();
    }


    updateValueF() { }

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
        this.needsUpdate = true;
        this._value = v;
    }

    setValueT(v)
    {
        if (this._value != v)
            this._shader.needsPipelineUpdate = "texture changed"; // todo really needed ? change binding instead?

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


    copyToBuffer(buff, pos = 0)
    {
        if (this._type == "f") buff[pos] = this._value;
        else
        if (this._type == "t")
        {

        }
        else if (this._type == "4f")
        {
            buff[pos] = this._value[0];
            buff[pos + 1] = this._value[1];
            buff[pos + 2] = this._value[2];
            buff[pos + 3] = this._value[3];
        }
        else if (this._type == "m4")
        {
            // const mView = buff.subarray(pos, pos + 16);

            for (let i = 0; i < 16; i++)
            {
                buff[pos + i] = this._value[i];

                // console.log(this._value[i]);
            }
            // console.log(buff);

            // mat4.copy(mView, this._value);
        }
        else
        {
            this._log.warn("uniform copy to buffer unknown", this._type);
        }
    }

    getSizeBytes()
    {
        const bytesPerFloat = 4;
        const bytesPerInt = 4;
        if (this._type == "f") return 1 * bytesPerFloat;
        if (this._type == "2f") return 2 * bytesPerFloat;
        if (this._type == "3f") return 3 * bytesPerFloat;
        if (this._type == "4f") return 4 * bytesPerFloat;

        if (this._type == "m4") return 4 * 4 * bytesPerFloat;

        if (this._type == "i") return 1 * bytesPerInt;
        if (this._type == "2i") return 2 * bytesPerInt;

        // this._log.warn("unknown type getSizeBytes");
        return 4;
        // if (this._type == "t") return "sampler2D";
        // if (this._type == "tc") return "samplerCube";
        // if (this._type == "b") return "bool";

        // if (t == "3f[]") return null; // ignore this for now...
        // if (t == "m4[]") return null; // ignore this for now...
        // if (t == "f[]") return null; // ignore this for now...
    }
}
