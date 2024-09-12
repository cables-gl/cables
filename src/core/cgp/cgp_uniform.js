import CgUniform from "../cg/cg_uniform.js";

export default class Uniform extends CgUniform
{
    constructor(__shader, __type, __name, _value, _port2, _port3, _port4, _structUniformName, _structName, _propertyName)
    {
        super(__shader, __type, __name, _value, _port2, _port3, _port4, _structUniformName, _structName, _propertyName);
        this._loc = -1;
        this._cgl = __shader._cgl;
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

    getSizeBytes()
    {
        if (this._type == "f") return 1 * 4;
        if (this._type == "i") return 1 * 4;
        if (this._type == "2i") return 2 * 4;
        if (this._type == "2f") return 2 * 4;
        if (this._type == "3f") return 3 * 4;
        if (this._type == "4f") return 4 * 4;
        if (this._type == "m4") return 4 * 4 * 4;

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
