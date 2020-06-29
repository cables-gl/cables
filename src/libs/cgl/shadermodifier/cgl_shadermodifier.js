class ShaderModifier
{
    constructor(cgl, name, options)
    {
        this._cgl = cgl;
        this._name = name;
        this._shaders = {};
        this._uniforms = [];
        this._definesToggled = {};
        this._defines = {};
        this._mods = [];
        this._boundShader = null;
        this._changedDefines = true;
        this._changedUniforms = true;
    }

    bind()
    {
        const shader = this._cgl.getShader();
        if (!shader) return;

        this._boundShader = this._shaders[shader.id];
        if (!this._boundShader || shader.lastCompile != this._boundShader.lastCompile)
        {
            if (this._boundShader) this._boundShader.shader.dispose();

            this._boundShader = this._shaders[shader.id] =
                {
                    "lastCompile": shader.lastCompile,
                    "orig": shader,
                    "shader": shader.copy()
                };

            this._addModulesToShader(this._boundShader.shader);
            this._updateDefinesShader(this._boundShader.shader);
            this._updateUniformsShader(this._boundShader.shader);

            console.log("copied shader...", this._boundShader.shader);
        }

        if (this._changedDefines) this._updateDefines();
        if (this._changedUniforms) this._updateUniforms();


        this._cgl.pushShader(this._boundShader.shader);
        this._boundShader.shader.copyUniformValues(this._boundShader.orig);
    }

    unbind()
    {
        if (this._boundShader) this._cgl.popShader();
        this._boundShader = null;
    }

    _addModulesToShader(shader)
    {
        let firstMod;
        if (this._mods.length > 1) firstMod = this._mods[0];
        for (let i = 0; i < this._mods.length; i++)
            shader.addModule(this._mods[i], firstMod);
    }

    _removeModulesFromShader(mod)
    {
        for (const j in this._shaders)
        {
            this._shaders[j].shader.removeModule(mod);
            console.log("removed", mod, "in shader", this._shaders[j].shader);
        }
    }

    addModule(mod)
    {
        this._mods.push(mod);
    }

    removeModule(title)
    {
        const indicesToRemove = [];
        for (let i = 0; i < this._mods.length; i++)
        {
            if (this._mods[i].title == title)
            {
                console.log("index", i, "length", this._mods.length, "removing", this._mods[i].title, this._mods[i]);
                this._removeModulesFromShader(this._mods[i]);
                indicesToRemove.push(i);

                console.log("index", i, "length", this._mods.length, "after remove");
            }
        }

        for (let j = 0; j < indicesToRemove.length; j += 1)
        {
            this._mods.splice(indicesToRemove[j], 1);
        }
    }

    _updateUniformsShader(shader)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            const uni = this._uniforms[i];

            const name = this._getDefineName(uni.name);
            let structUniformName = uni.structUniformName;
            let structName = uni.structName;

            if (uni.structUniformName && uni.structName)
            {
                structUniformName = this._getDefineName(uni.structUniformName);
                structName = this._getDefineName(uni.structName);
            }

            if (!shader.hasUniform(name))
            {
                // console.log("adding addUniformBoth", name, type, uni);
                let un = null;
                if (uni.shaderType === "both")
                {
                    console.log("adding addUniformBoth", name, uni.type, uni);
                    un = shader.addUniformBoth(uni.type, name, uni.v1, uni.v2, uni.v3, uni.v4, structUniformName, structName, uni.propertyName);
                    un.comment = "mod: " + this._name;
                }
                else if (uni.shaderType === "frag")
                {
                    console.log("adding addUniformFrag", name, uni.type, uni);
                    un = shader.addUniformFrag(uni.type, name, uni.v1, uni.v2, uni.v3, uni.v4, structUniformName, structName, uni.propertyName);
                    un.comment = "mod: " + this._name;
                }
                else if (uni.shaderType === "vert")
                {
                    console.log("adding addUniformVert", name, uni.type, uni);
                    un = shader.addUniformVert(uni.type, name, uni.v1, uni.v2, uni.v3, uni.v4, structUniformName, structName, uni.propertyName);
                    un.comment = "mod: " + this._name;
                }
            }
            else console.log("has uni", name);
        }
    }

    _updateUniforms()
    {
        for (const j in this._shaders)
            this._updateUniformsShader(this._shaders[j].shader);

        this._changedUniforms = false;
    }

    _setUniformValue(shader, uniformName, value)
    {
        const uniform = shader.getUniform(uniformName);
        if (uniform) uniform.setValue(value);
    }

    setUniformValue(name, value)
    {
        const uni = this._getUniform(name);
        if (!uni) return;


        const defineName = this._getDefineName(name);
        // console.log("setting", name, defineName, value);
        for (const j in this._shaders)
        {
            this._setUniformValue(this._shaders[j].shader, defineName, value);
        }
    }

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

    _isStructUniform(name)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            if (this._uniforms[i].name == name) return false;
            if (this._uniforms[i].structName)
            {
                if (this._uniforms[i].propertyName == name) return true;
            }
        }
        return false;
    }

    addUniform(type, name, valOrPort, v2, v3, v4, structUniformName, structName, propertyName, shaderType)
    {
        if (structUniformName)
        {
            if (!this._getUniform(structUniformName + "." + name))
            {
                let _shaderType = "both";
                if (shaderType) _shaderType = shaderType;
                console.log("NAME", name, "TYPE", type, "SHADERTYPE", _shaderType);
                this._uniforms.push(
                    {
                        "type": type,
                        "name": structUniformName ? (structUniformName + "." + name) : name,
                        "v1": valOrPort,
                        "v2": v2,
                        "v3": v3,
                        "v4": v4,
                        "structUniformName": structUniformName,
                        "structName": structName,
                        "propertyName": name,
                        "shaderType": _shaderType,
                    });
                this._changedUniforms = true;
            }
            return;
        }

        if (!this._getUniform(name))
        {
            let _shaderType = "both";
            if (shaderType) _shaderType = shaderType;

            this._uniforms.push(
                {
                    "type": type,
                    "name": structUniformName ? (structUniformName + "." + name) : name,
                    "v1": valOrPort,
                    "v2": v2,
                    "v3": v3,
                    "v4": v4,
                    "structUniformName": structUniformName,
                    "structName": structName,
                    "propertyName": name,
                    "shaderType": _shaderType,
                });
            this._changedUniforms = true;
        }
    }


    addUniformsStruct(structUniformName, structName, structMembers, shaderType)
    {
        if (!structName) return;
        if (!structMembers) return;

        for (let i = 0; i < structMembers.length; i += 1)
        {
            const member = structMembers[i];

            if (!this._getUniform(structUniformName + "." + member.name))
            {
                let _shaderType = "both";
                if (shaderType) _shaderType = shaderType;

                this.addUniform(
                    member.type,
                    member.name,
                    member.v1,
                    member.v2,
                    member.v3,
                    member.v4,
                    structUniformName,
                    structName,
                    null,
                    _shaderType
                );
            }
        }
    }

    pushTexture(uniformName, tex, texType)
    {
        if (!tex) throw (new Error("no texture given to texturestack"));
        if (this._getUniform(uniformName))
        {
            const name = this._getDefineName(uniformName);
            for (const j in this._shaders)
            {
                const shader = this._shaders[j].shader;
                const uni = shader.getUniform(name);
                if (uni) shader.pushTexture(uni, tex, texType);
            }
        }
    }

    _removeUniformFromShader(name, shader)
    {
        if (shader.hasUniform(name)) shader.removeUniform(name);
    }

    removeUniform(name)
    {
        if (this._getUniform(name))
        {
            for (const j in this._shaders)
            {
                console.log("removing", this._getDefineName(name));
                this._removeUniformFromShader(
                    this._getDefineName(name),
                    this._shaders[j].shader
                );
            }

            for (let i = 0; i < this._uniforms.length; i++)
            {
                if (this._uniforms[i].name == name)
                {
                    this._uniforms.splice(i, 1);
                }
            }
            this._changedUniforms = true;
        }
    }


    _getDefineName(name)
    {
        const prefix = this._mods[0].group;
        if (name.indexOf("MOD_") == 0)
        {
            name = name.substr("MOD_".length);
            name = "mod" + prefix + name;
            // console.log("name", name);
        }
        return name;
    }

    _updateDefinesShader(shader)
    {
        // console.log("_updateDefinesShader", this._defines);

        for (const i in this._defines)
        {
            const name = this._getDefineName(i);
            if (this._defines[i] !== null || this._defines[i] !== undefined) shader.define(name, this._defines[i]);
            else shader.removeDefine(name);
        }

        for (const i in this._definesToggled)
        {
            const name = this._getDefineName(i);
            shader.toggleDefine(name, this._definesToggled[i]);
        }
    }

    _updateDefines()
    {
        for (const j in this._shaders) this._updateDefinesShader(this._shaders[j].shader);

        this._changedDefines = false;
    }

    define(what, value)
    {
        this._defines[what] = value;
        this._changedDefines = true;
    }

    removeDefine(name)
    {
        this._defines[name] = null;
        this._changedDefines = true;
    }

    hasDefine(name)
    {
    //    console.log("hasDefine", this._defines);
        if (this._defines[name] !== null && this._defines[name] !== undefined) return true;
        return false;
    }

    toggleDefine(name, b)
    {
        this._changedDefines = true;
        this._definesToggled[name] = b;
    }

    currentShader()
    {
        return this._boundShader.shader;
    }

    dispose()
    {

    }
}


export { ShaderModifier };
