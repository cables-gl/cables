import { CgShader } from "../cg/cg_shader.js";
import { Binding } from "./binding/binding.js";
import { CgpShader } from "./cgp_shader.js";
import { CgpContext } from "./cgp_state.js";
import { CgpUniform } from "./cgp_uniform.js";

class ShaderModifier
{
    onBind = null;

    /**
     * @param {CgpContext} cgl
     * @param {string} name
     * @param {object} options
     */
    constructor(cgl, name, options)
    {

        /** @type {CgpContext} */
        this._cgl = cgl;
        this._name = name;
        this._origShaders = {};

        /** @type {Array<object>} */
        this._uniforms = [];
        this._structUniforms = [];
        this._definesToggled = {};
        this._defines = {};
        this._mods = [];
        this._textures = [];

        /** @type {object} */
        this._boundShader = null;
        this._changedDefines = true;
        this._changedUniforms = true;
        this._modulesChanged = false;
        this.needsTexturePush = false;

        /** @type {CgpShader} */
        this._lastShader = null;
        this._attributes = [];
        if (options && options.opId) this.opId = options.opId;

        /** @type {Binding[]} */
        this.bindings = [];
    }

    /**
     * @param {CgpShader} curShader
     * @param {boolean} pushShader
     */
    bind(curShader, pushShader)
    {
        const shader = curShader || this._cgl.getShader();
        if (!shader) return;

        this._boundShader = this._origShaders[shader.id];
        let missingMod = false;

        if (this._boundShader && this._lastShader != this._boundShader.shader) // shader changed since last bind
        {
            if (!this._boundShader.shader.hasModule(this._mods[0].id)) missingMod = true;
        }

        if (missingMod) console.warn("copy because  (missingMod)");
        if (!this._boundShader) console.warn("copy because  (!this._boundShader)");
        else if (shader.lastCompile != this._boundShader.lastCompile) console.warn("copy because  shader.lastCompile");
        if (this._modulesChanged) console.warn("copy because  this._modulesChanged");
        if (shader._needsRecompile) console.warn("copy because  shader._needsRecompile ", shader._compileReason);
        if (missingMod || !this._boundShader || shader.lastCompile != this._boundShader.lastCompile || this._modulesChanged || shader._needsRecompile)
        {
            if (this._boundShader) this._boundShader.shader.dispose();
            if (shader._needsRecompile) shader.compile();
            this.needsTexturePush = true;

            this._boundShader = this._origShaders[shader.id] =
            {
                "lastCompile": shader.lastCompile,
                "orig": shader,
                "shader": shader.copy()
            };

            this._addModulesToShader(this._boundShader.shader);
            this._updateDefinesShader(this._boundShader.shader);
            this._updateUniformsShader(this._boundShader.shader);
        }

        this._boundShader.wireframe = shader.wireframe;
        if (this._changedDefines) this._updateDefines();
        if (this._changedUniforms) this._updateUniforms();

        if (pushShader !== false) this._cgl.pushShader(this._boundShader.shader);

        this._boundShader.shader.copyUniformValues(this._boundShader.orig);

        if (this.needsTexturePush)
        {
            for (let j = 0; j < this._textures.length; j++)
            {
                const uniformName = this._textures[j][0];
                const tex = this._textures[j][1];
                const texType = this._textures[j][2];

                if (this._getUniform(uniformName))
                {
                    const name = this.getPrefixedName(uniformName);
                    const uni = this._boundShader.shader.getUniform(name);

                    if (uni) this._boundShader.shader.pushTexture(uni, tex, texType);
                }
            }

            this.needsTexturePush = false;
            this._textures.length = 0;
        }

        this._modulesChanged = false;

        this._boundShader.shader.fromMod = this;

        if (this.onBind) this.onBind(this._boundShader.shader);

        return this._boundShader.shader;
    }

    /**
     * @param {boolean} popShader
     */
    unbind(popShader)
    {
        if (this._boundShader)
            if (popShader !== false) this._cgl.popShader();
        this._boundShader = null;
    }

    /**
     * @param {CgpShader} shader
     */
    _addModulesToShader(shader)
    {
        let firstMod;

        if (this._mods.length > 1) firstMod = this._mods[0];

        for (let i = 0; i < this._mods.length; i++) shader.addModule(this._mods[i], firstMod);
    }

    /**
     * @param {import("../cg/cg_shader.js").ShaderModule} mod
     */
    _removeModulesFromShader(mod)
    {
        for (const j in this._origShaders) this._origShaders[j].shader.removeModule(mod);
    }

    /**
     * @param {import("../cg/cg_shader.js").ShaderModule} mod
     */
    addModule(mod)
    {
        this._mods.push(mod);
        this._modulesChanged = true;
    }

    /**
     * @param {string} title
     */
    removeModule(title)
    {
        const indicesToRemove = [];

        let found = false;
        for (let i = 0; i < this._mods.length; i++)
        {
            if (this._mods[i].title == title)
            {
                found = true;
                this._removeModulesFromShader(this._mods[i]);
                indicesToRemove.push(i);
            }
        }

        // * go in reverse order so the indices of the mods stay the same
        for (let j = indicesToRemove.length - 1; j >= 0; j -= 1)
            this._mods.splice(indicesToRemove[j], 1);

        this._modulesChanged = true;
    }

    /**
     * @param {CgpShader} shader
     */
    _updateUniformsShader(shader)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            const uni = this._uniforms[i];
            const name = this.getPrefixedName(uni.name);

            if (!shader.hasUniform(name))
            {
                console.log("shadermod uni ", uni.name);
                const u = new CgpUniform(shader, "3f", uni.name, uni.v1, uni.v2, uni.v3, uni.v4);

                console.log(uni);
                shader.addUniform(u, uni.stage);
            }
        }

    }

    _updateUniforms()
    {
        for (const j in this._origShaders)
            this._updateUniformsShader(this._origShaders[j].shader);

        this._changedUniforms = false;
    }

    /**
     * @param {CgShader} shader
     * @param {string} uniformName
     * @param {number} value
     */
    _setUniformValue(shader, uniformName, value)
    {
        const uniform = shader.getUniform(uniformName);

        if (uniform) uniform.setValue(value);
    }

    /**
     * @param {string} name
     * @param {number} value
     */
    setUniformValue(name, value)
    {
        const uni = this._getUniform(name);
        if (!uni) return;

        const defineName = this.getPrefixedName(name);

        for (const j in this._origShaders)
        {
            this._setUniformValue(this._origShaders[j].shader, defineName, value);
        }
    }

    /**
     * @param {string} name
     */
    hasUniform(name)
    {
        return this._getUniform(name);
    }

    /**
     * @param {string} name
     */
    _getUniform(name)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            if (this._uniforms[i].name == name) return this._uniforms[i];
            if (this._uniforms[i].structName)
            {
                if (this._uniforms[i].propertyName == name) return this._uniforms[i];
            }
        }
        return false;
    }

    /**
     * @param {any} stage
     * @param {string} name
     * @param {any} valOrPort
     * @param {any} v2
     * @param {any} v3
     * @param {any} v4
     * @param {string} shaderType
     */
    addUniform(stage, name, valOrPort, v2, v3, v4, shaderType)
    {
        if (!this._getUniform(name))
        {

            this._uniforms.push(
                {
                    "name": name,
                    "v1": valOrPort,
                    "v2": v2,
                    "v3": v3,
                    "v4": v4,
                    "stage": stage,
                });
            this._changedUniforms = true;
        }
    }

    // addUniformFrag(type, name, valOrPort, v2, v3, v4)
    // {
    //     this.addUniform(type, name, valOrPort, v2, v3, v4, null, null, null, "frag");
    //     this._changedUniforms = true;
    // }

    // addUniformVert(type, name, valOrPort, v2, v3, v4)
    // {
    //     this.addUniform(type, name, valOrPort, v2, v3, v4, null, null, null, "vert");
    //     this._changedUniforms = true;
    // }

    // addUniformBoth(type, name, valOrPort, v2, v3, v4)
    // {
    //     this.addUniform(type, name, valOrPort, v2, v3, v4, null, null, null, "both");
    //     this._changedUniforms = true;
    // }

    // addUniformStruct(structName, uniformName, members, shaderType)
    // {
    //     for (let i = 0; i < members.length; i += 1)
    //     {
    //         const member = members[i];
    //         if ((member.type === "2i" || member.type === "i" || member.type === "3i") && shaderType === "both")
    //             console.error("Adding an integer struct member to both shaders can potentially error. Please use different structs for each shader. Error occured in struct:", structName, " with member:", member.name, " of type:", member.type, ".");

    //         if (!this._getUniform(uniformName + "." + member.name))
    //         {
    //             this.addUniform(
    //                 member.type,
    //                 uniformName + "." + member.name,
    //                 member.v1,
    //                 member.v2,
    //                 member.v3,
    //                 member.v4,
    //                 uniformName,
    //                 structName,
    //                 member.name,
    //                 shaderType
    //             );
    //         }
    //     }
    //     if (!this._getStructUniform(uniformName))
    //     {
    //         this._structUniforms.push({
    //             "structName": structName,
    //             "uniformName": uniformName,
    //             "members": members,
    //             "shaderType": shaderType,
    //         });
    //     }
    // }

    // addUniformStructVert(structName, uniformName, members)
    // {
    //     this.addUniformStruct(structName, uniformName, members, "vert");
    // }

    // addUniformStructFrag(structName, uniformName, members)
    // {
    //     this.addUniformStruct(structName, uniformName, members, "frag");
    // }

    // addUniformStructBoth(structName, uniformName, members)
    // {
    //     this.addUniformStruct(structName, uniformName, members, "both");
    // }

    addAttribute(attr)
    {
        for (let i = 0; i < this._attributes.length; i++)
        {
            if (this._attributes[i].name == attr.name && this._attributes[i].nameFrag == attr.nameFrag) return;
        }
        this._attributes.push(attr);
    }

    pushTexture(uniformName, tex, texType)
    {
        if (!tex) throw (new Error("no texture given to texturestack"));

        this._textures.push([uniformName, tex, texType]);
        this.needsTexturePush = true;
    }

    /**
     * @param {string} name
     * @param {CgShader} shader
     */
    _removeUniformFromShader(name, shader)
    {
        if (shader.hasUniform(name)) shader.removeUniform(name);
    }

    /**
     * @param {string} name
     */
    removeUniform(name)
    {
        if (this._getUniform(name))
        {
            for (let j = this._uniforms.length - 1; j >= 0; j -= 1)
            {
                const nameToRemove = name;

                if (this._uniforms[j].name == name && !this._uniforms[j].structName)
                {
                    for (const k in this._origShaders)
                    {
                        this._removeUniformFromShader(
                            this.getPrefixedName(nameToRemove),
                            this._origShaders[k].shader
                        );
                    }

                    this._uniforms.splice(j, 1);
                }
            }
            this._changedUniforms = true;
        }
    }

    /**
     * @param {string} name
     */
    getPrefixedName(name)
    {
        const prefix = this._mods[0].group;
        if (prefix === undefined)
        {
            return;
        }
        if (name.startsWith("MOD_"))
        {
            name = name.substr("MOD_".length);
            name = "mod" + prefix + "_" + name;
        }
        return name;
    }

    /**
     * @param {CgpShader} shader
     */
    _updateDefinesShader(shader)
    {
        for (const i in this._defines)
        {
            const name = this.getPrefixedName(i);
            if (this._defines[i] !== null && this._defines[i] !== undefined) shader.define(name, this._defines[i]);
            else shader.removeDefine(name);
        }

        for (const i in this._definesToggled)
        {
            const name = this.getPrefixedName(i);
            shader.toggleDefine(name, this._definesToggled[i]);
        }
    }

    _updateDefines()
    {
        for (const j in this._origShaders) this._updateDefinesShader(this._origShaders[j].shader);

        this._changedDefines = false;
    }

    /**
     * @param {string | number} what
     * @param {boolean} value
     */
    define(what, value)
    {
        if (value === undefined)value = true;
        this._defines[what] = value;
        this._changedDefines = true;
    }

    /**
     * @param {string} name
     */
    removeDefine(name)
    {
        this._defines[name] = null;
        this._changedDefines = true;
    }

    /**
     * @param {string} name
     */
    hasDefine(name)
    {
        if (this._defines[name] !== null && this._defines[name] !== undefined) return true;
        return false;
    }

    /**
     * @param {string} name
     * @param {any} b
     */
    toggleDefine(name, b)
    {
        this._changedDefines = true;
        this._definesToggled[name] = b;
    }

    currentShader()
    {
        if (!this._boundShader) return null;
        return this._boundShader.shader;
    }

    dispose()
    {

    }
}

export { ShaderModifier };
