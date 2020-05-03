import { profileData } from "./cgl_profiledata";
import { Port } from "../core_port";
import { Log } from "../log";

/**
 * Shader uniforms
 *
 * types:
 * <pre>
 * f    - float
 * 2f   - vec2
 * 3f   - vec3
 * 4f   - vec4
 * i    - integer
 * t    - texture
 * m4   - mat4, 4x4 float matrix
 * f[]  - array of floats
 * 2f[] - array of float vec2
 * 3f[] - array of float vec3
 * 4f[] - array of float vec4
 * </pre>
 *
 * @external CGL
 * @namespace Uniform
 * @class
 * @param {Shader} shader
 * @param {String} [type=f]
 * @param {String} name
 * @param {Number|Port} value  can be a Number,Matrix or Port
 * @example
 * // bind float uniform called myfloat and initialize with value 1.0
 * const unir=new CGL.Uniform(shader,'f','myfloat',1.0);
 * unir.setValue(1.0);
 *
 * // bind float uniform called myfloat and automatically set it to input port value
 * const myPort=op.inFloat("input");
 * const pv=new CGL.Uniform(shader,'f','myfloat',myPort);
 *
 */
export const Uniform = function (__shader, __type, __name, _value, _port2, _port3, _port4)
{
    this._loc = -1;
    this._type = __type;
    this._name = __name;
    this._shader = __shader;
    this._value = 0.00001;
    this._oldValue = null;
    this._port = null;
    this._shader.addUniform(this);
    this.needsUpdate = true;

    if (__type == "f")
    {
        this.set = this.setValue = this.setValueF.bind(this);
        this.updateValue = this.updateValueF.bind(this);
    }
    else if (__type == "f[]")
    {
        this.set = this.setValue = this.setValueArrayF.bind(this);
        this.updateValue = this.updateValueArrayF.bind(this);
    }
    else if (__type == "2f[]")
    {
        this.set = this.setValue = this.setValueArray2F.bind(this);
        this.updateValue = this.updateValueArray2F.bind(this);
    }
    else if (__type == "3f[]")
    {
        this.set = this.setValue = this.setValueArray3F.bind(this);
        this.updateValue = this.updateValueArray3F.bind(this);
    }
    else if (__type == "4f[]")
    {
        this.set = this.setValue = this.setValueArray4F.bind(this);
        this.updateValue = this.updateValueArray4F.bind(this);
    }
    else if (__type == "i")
    {
        this.set = this.setValue = this.setValueI.bind(this);
        this.updateValue = this.updateValueI.bind(this);
    }
    else if (__type == "2i")
    {
        this.set = this.setValue = this.setValue2I.bind(this);
        this.updateValue = this.updateValue2I.bind(this);
    }
    else if (__type == "3i")
    {
        this.set = this.setValue = this.setValue3I.bind(this);
        this.updateValue = this.updateValue3I.bind(this);
    }
    else if (__type == "4i")
    {
        this.set = this.setValue = this.setValue4I.bind(this);
        this.updateValue = this.updateValue4I.bind(this);
    }
    else if (__type == "b")
    {
        this.set = this.setValue = this.setValueBool.bind(this);
        this.updateValue = this.updateValueBool.bind(this);
    }
    else if (__type == "4f")
    {
        this.set = this.setValue = this.setValue4F.bind(this);
        this.updateValue = this.updateValue4F.bind(this);
    }
    else if (__type == "3f")
    {
        this.set = this.setValue = this.setValue3F.bind(this);
        this.updateValue = this.updateValue3F.bind(this);
    }
    else if (__type == "2f")
    {
        this.set = this.setValue = this.setValue2F.bind(this);
        this.updateValue = this.updateValue2F.bind(this);
    }
    else if (__type == "t")
    {
        this.set = this.setValue = this.setValueT.bind(this);
        this.updateValue = this.updateValueT.bind(this);
    }
    else if (__type == "t[]")
    {
        this.set = this.setValue = this.setValueArrayT.bind(this);
        this.updateValue = this.updateValueArrayT.bind(this);
    }
    else if (__type == "m4")
    {
        this.set = this.setValue = this.setValueM4.bind(this);
        this.updateValue = this.updateValueM4.bind(this);
    }
    else throw new Error("Unknown uniform type");

    if (typeof _value == "object" && _value instanceof Port)
    {
        this._port = _value;
        this._value = this._port.get();
        this._port.onValueChanged = this.updateFromPort.bind(this);

        if (_port2 && _port3 && _port4)
        {
            this._value = [0, 0, 0, 0];
            this._port2 = _port2;
            this._port3 = _port3;
            this._port4 = _port4;
            this._port.onChange = this._port2.onChange = this._port3.onChange = this._port4.onChange = this.updateFromPort4f.bind(
                this,
            );
            this.updateFromPort4f();
        }
        else if (_port2 && _port3)
        {
            this._value = [0, 0, 0];
            this._port2 = _port2;
            this._port3 = _port3;
            this._port.onChange = this._port2.onChange = this._port3.onChange = this.updateFromPort3f.bind(this);
            this.updateFromPort3f();
        }
        else if (_port2)
        {
            this._value = [0, 0];
            this._port2 = _port2;
            this._port.onChange = this._port2.onChange = this.updateFromPort2f.bind(this);
            this.updateFromPort2f();
        }
    }
    else this._value = _value;

    this.setValue(this._value);
    this.needsUpdate = true;
};

Uniform.prototype.copy = function (newShader)
{
    return new Uniform(newShader, this._type, this._name);
};

Uniform.prototype.getType = function ()
{
    return this._type;
};
Uniform.prototype.getName = function ()
{
    return this._name;
};
Uniform.prototype.getValue = function ()
{
    return this._value;
};
Uniform.prototype.resetLoc = function ()
{
    this._loc = -1;
    this.needsUpdate = true;
};

Uniform.prototype.bindTextures = function ()
{
    return this._value;
};

Uniform.prototype.resetLoc = function ()
{
    this._loc = -1;
    this.needsUpdate = true;
};

Uniform.prototype.bindTextures = function () {};

Uniform.prototype.getLoc = function ()
{
    return this._loc;
};

Uniform.prototype.updateFromPort4f = function ()
{
    this._value[0] = this._port.get();
    this._value[1] = this._port2.get();
    this._value[2] = this._port3.get();
    this._value[3] = this._port4.get();
    this.setValue(this._value);
};

Uniform.prototype.updateFromPort3f = function ()
{
    this._value[0] = this._port.get();
    this._value[1] = this._port2.get();
    this._value[2] = this._port3.get();
    this.setValue(this._value);
};

Uniform.prototype.updateFromPort2f = function ()
{
    this._value[0] = this._port.get();
    this._value[1] = this._port2.get();
    this.setValue(this._value);
};

Uniform.prototype.updateFromPort = function ()
{
    this.setValue(this._port.get());
};

Uniform.prototype.updateValueF = function ()
{
    if (this._loc == -1) this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
    else this.needsUpdate = false;

    this._shader.getCgl().gl.uniform1f(this._loc, this._value);
    profileData.profileUniformCount++;
};

Uniform.prototype.setValueF = function (v)
{
    if (v != this._value)
    {
        this.needsUpdate = true;
        this._value = v;
    }
};

Uniform.prototype.updateValueI = function ()
{
    if (this._loc == -1) this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
    else this.needsUpdate = false;

    this._shader.getCgl().gl.uniform1i(this._loc, this._value);
    profileData.profileUniformCount++;
};

Uniform.prototype.updateValue2I = function ()
{
    if (!this._value) return;

    if (this._loc == -1)
    {
        this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        profileData.profileShaderGetUniform++;
        profileData.profileShaderGetUniformName = this._name;
    }

    this._shader.getCgl().gl.uniform2i(this._loc, this._value[0], this._value[1]);
    this.needsUpdate = false;
    profileData.profileUniformCount++;
};

Uniform.prototype.updateValue3I = function ()
{
    if (!this._value) return;
    if (this._loc == -1)
    {
        this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        profileData.profileShaderGetUniform++;
        profileData.profileShaderGetUniformName = this._name;
    }

    this._shader.getCgl().gl.uniform3i(this._loc, this._value[0], this._value[1], this._value[2]);
    this.needsUpdate = false;
    profileData.profileUniformCount++;
};

Uniform.prototype.updateValue4I = function ()
{
    if (this._loc == -1)
    {
        this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        profileData.profileShaderGetUniform++;
        profileData.profileShaderGetUniformName = this._name;
    }
    this._shader.getCgl().gl.uniform4i(this._loc, this._value[0], this._value[1], this._value[2], this._value[3]);
    profileData.profileUniformCount++;
};

Uniform.prototype.setValueI = function (v)
{
    if (v != this._value)
    {
        this.needsUpdate = true;
        this._value = v;
    }
};

Uniform.prototype.setValue2I = function (v)
{
    if (!v) return;
    if (!this._oldValue)
    {
        this._oldValue = [v[0] - 1, 1];
        this.needsUpdate = true;
    }
    else if (v[0] != this._oldValue[0] || v[1] != this._oldValue[1])
    {
        this._oldValue[0] = v[0];
        this._oldValue[1] = v[1];
        this.needsUpdate = true;
    }

    this._value = v;
};

Uniform.prototype.setValue3I = function (v)
{
    if (!v) return;
    if (!this._oldValue)
    {
        this._oldValue = [v[0] - 1, 1, 2];
        this.needsUpdate = true;
    }
    else if (v[0] != this._oldValue[0] || v[1] != this._oldValue[1] || v[2] != this._oldValue[2])
    {
        this._oldValue[0] = v[0];
        this._oldValue[1] = v[1];
        this._oldValue[2] = v[2];
        this.needsUpdate = true;
    }

    this._value = v;
};

Uniform.prototype.setValue4I = function (v)
{
    this.needsUpdate = true;
    this._value = v || vec4.create();
};

Uniform.prototype.updateValueBool = function ()
{
    if (this._loc == -1) this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
    else this.needsUpdate = false;
    this._shader.getCgl().gl.uniform1i(this._loc, this._value ? 1 : 0);

    profileData.profileUniformCount++;
};

Uniform.prototype.setValueBool = function (v)
{
    if (v != this._value)
    {
        this.needsUpdate = true;
        this._value = v;
    }
};
Uniform.prototype.setValueArray4F = function (v)
{
    this.needsUpdate = true;
    this._value = v;
};

Uniform.prototype.updateValueArray4F = function ()
{
    if (this._loc == -1) this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
    else this.needsUpdate = false;

    if (!this._value) return;
    this._shader.getCgl().gl.uniform4fv(this._loc, this._value);
    profileData.profileUniformCount++;
};

Uniform.prototype.setValueArray3F = function (v)
{
    this.needsUpdate = true;
    this._value = v;
};

Uniform.prototype.updateValueArray3F = function ()
{
    if (this._loc == -1) this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
    else this.needsUpdate = false;

    if (!this._value) return;
    this._shader.getCgl().gl.uniform3fv(this._loc, this._value);
    profileData.profileUniformCount++;
};

Uniform.prototype.setValueArray2F = function (v)
{
    this.needsUpdate = true;
    this._value = v;
};

Uniform.prototype.updateValueArray2F = function ()
{
    if (this._loc == -1) this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
    else this.needsUpdate = false;

    if (!this._value) return;
    this._shader.getCgl().gl.uniform2fv(this._loc, this._value);
    profileData.profileUniformCount++;
};

Uniform.prototype.setValueArrayF = function (v)
{
    this.needsUpdate = true;
    this._value = v;
};

Uniform.prototype.updateValueArrayF = function ()
{
    if (this._loc == -1) this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
    else this.needsUpdate = false;

    if (!this._value) return;
    this._shader.getCgl().gl.uniform1fv(this._loc, this._value);
    profileData.profileUniformCount++;
};

Uniform.prototype.setValueArrayT = function (v)
{
    this.needsUpdate = true;
    this._value = v;
};

Uniform.prototype.updateValueArrayT = function ()
{
    if (this._loc == -1) this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
    else this.needsUpdate = false;

    if (!this._value) return;
    this._shader.getCgl().gl.uniform1iv(this._loc, this._value);
    profileData.profileUniformCount++;
};

Uniform.prototype.updateValue3F = function ()
{
    if (!this._value) return;
    if (this._loc == -1)
    {
        this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        profileData.profileShaderGetUniform++;
        profileData.profileShaderGetUniformName = this._name;
    }

    this._shader.getCgl().gl.uniform3f(this._loc, this._value[0], this._value[1], this._value[2]);
    this.needsUpdate = false;
    profileData.profileUniformCount++;
};

Uniform.prototype.setValue3F = function (v)
{
    if (!v) return;
    if (!this._oldValue)
    {
        this._oldValue = [v[0] - 1, 1, 2];
        this.needsUpdate = true;
    }
    else if (v[0] != this._oldValue[0] || v[1] != this._oldValue[1] || v[2] != this._oldValue[2])
    {
        this._oldValue[0] = v[0];
        this._oldValue[1] = v[1];
        this._oldValue[2] = v[2];
        this.needsUpdate = true;
    }

    this._value = v;
};

Uniform.prototype.updateValue2F = function ()
{
    if (!this._value) return;

    if (this._loc == -1)
    {
        this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        profileData.profileShaderGetUniform++;
        profileData.profileShaderGetUniformName = this._name;
    }

    this._shader.getCgl().gl.uniform2f(this._loc, this._value[0], this._value[1]);
    this.needsUpdate = false;
    profileData.profileUniformCount++;
};

Uniform.prototype.setValue2F = function (v)
{
    if (!v) return;
    if (!this._oldValue)
    {
        this._oldValue = [v[0] - 1, 1];
        this.needsUpdate = true;
    }
    else if (v[0] != this._oldValue[0] || v[1] != this._oldValue[1])
    {
        this._oldValue[0] = v[0];
        this._oldValue[1] = v[1];
        this.needsUpdate = true;
    }

    this._value = v;
};

Uniform.prototype.updateValueT = function ()
{
    if (this._loc == -1)
    {
        this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        profileData.profileShaderGetUniform++;
        profileData.profileShaderGetUniformName = this._name;
        if (this._loc == -1) Log.log("texture this._loc unknown!!");
    }
    profileData.profileUniformCount++;

    this._shader.getCgl().gl.uniform1i(this._loc, this._value);
    this.needsUpdate = false;
};

Uniform.prototype.setValueT = function (v)
{
    this.needsUpdate = true;
    this._value = v;
};

Uniform.prototype.updateValue4F = function ()
{
    if (this._loc == -1)
    {
        this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        profileData.profileShaderGetUniform++;
        profileData.profileShaderGetUniformName = this._name;
    }
    this._shader.getCgl().gl.uniform4f(this._loc, this._value[0], this._value[1], this._value[2], this._value[3]);
    profileData.profileUniformCount++;
};

Uniform.prototype.setValue4F = function (v)
{
    this.needsUpdate = true;
    this._value = v || vec4.create();
};

Uniform.prototype.updateValueM4 = function ()
{
    if (this._loc == -1)
    {
        this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        profileData.profileShaderGetUniform++;
        profileData.profileShaderGetUniformName = this._name;
    }
    this._shader.getCgl().gl.uniformMatrix4fv(this._loc, false, this._value);
    profileData.profileUniformCount++;
};

Uniform.prototype.setValueM4 = function (v)
{
    this.needsUpdate = true;
    this._value = v || mat4.create();
};

/**
 * @function setValue
 * @memberof Uniform
 * @instance
 * @param {Number|Array|Matrix|Texture} value
 */

// export { Uniform };
