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
 * 3f[] - array of float triplets
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
export const Uniform = function (__shader, __type, __name, _value)
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
    else if (__type == "3f[]")
    {
        this.set = this.setValue = this.setValueArray3F.bind(this);
        this.updateValue = this.updateValueArray3F.bind(this);
    }
    else if (__type == "i")
    {
        this.set = this.setValue = this.setValueI.bind(this);
        this.updateValue = this.updateValueI.bind(this);
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
    }
    else this._value = _value;

    this.setValue(this._value);
    this.needsUpdate = true;
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
    profileData.UniformCount++;
};

Uniform.prototype.setValueI = function (v)
{
    if (v != this._value)
    {
        this.needsUpdate = true;
        this._value = v;
    }
};

Uniform.prototype.updateValueBool = function ()
{
    if (this._loc == -1) this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
    else this.needsUpdate = false;
    this._shader.getCgl().gl.uniform1i(this._loc, this._value ? 1 : 0);

    profileData.UniformCount++;
};

Uniform.prototype.setValueBool = function (v)
{
    if (v != this._value)
    {
        this.needsUpdate = true;
        this._value = v;
    }
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
    profileData.UniformCount++;
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
    profileData.UniformCount++;
};

Uniform.prototype.updateValue3F = function ()
{
    if (!this._value)
    {
        return;
    }
    if (this._loc == -1)
    {
        this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        profileData.ShaderGetUniform++;
        profileData.ShaderGetUniformName = this._name;
    }

    this._shader.getCgl().gl.uniform3f(this._loc, this._value[0], this._value[1], this._value[2]);
    this.needsUpdate = false;
    profileData.UniformCount++;
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
        profileData.ShaderGetUniform++;
        profileData.ShaderGetUniformName = this._name;
    }

    this._shader.getCgl().gl.uniform2f(this._loc, this._value[0], this._value[1]);
    this.needsUpdate = false;
    profileData.UniformCount++;
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
        profileData.ShaderGetUniform++;
        profileData.ShaderGetUniformName = this._name;
        if (this._loc == -1) Log.log("texture this._loc unknown!!");
    }
    profileData.UniformCount++;

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
        profileData.ShaderGetUniform++;
        profileData.ShaderGetUniformName = this._name;
    }
    this._shader.getCgl().gl.uniform4f(this._loc, this._value[0], this._value[1], this._value[2], this._value[3]);
    profileData.UniformCount++;
};

Uniform.prototype.setValue4F = function (v)
{
    this.needsUpdate = true;
    this._value = v;
};

Uniform.prototype.updateValueM4 = function ()
{
    if (this._loc == -1)
    {
        this._loc = this._shader.getCgl().gl.getUniformLocation(this._shader.getProgram(), this._name);
        profileData.ShaderGetUniform++;
        profileData.ShaderGetUniformName = this._name;
    }
    this._shader.getCgl().gl.uniformMatrix4fv(this._loc, false, this._value);
    profileData.UniformCount++;
};

Uniform.prototype.setValueM4 = function (v)
{
    this.needsUpdate = true;
    this._value = v;
};

/**
 * @function setValue
 * @memberof Uniform
 * @instance
 * @param {Number|Array|Matrix|Texture} value
 */

// export { Uniform };
