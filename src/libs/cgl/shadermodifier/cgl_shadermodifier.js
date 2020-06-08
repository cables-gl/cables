class ShaderModifier
{
    constructor(cgl, options)
    {
        this._cgl = cgl;
        this._shaders = {};
        this._uniforms = [];
        this._definesToggled = {};
        this._defines = {};
        this._mods = [];
        this._boundShader = null;
    }

    bind()
    {
        const shader = this._cgl.getShader();
        if (!shader) return;

        this._boundShader = this._shaders[shader.id];
        if (!this._boundShader)
        {
            this._boundShader = this._shaders[shader.id] =
            {
                "orig": shader,
                "shader": shader.copy()
            };

            this._addModulesToShader(this._boundShader.shader);
            this._updateDefinesShader(this._boundShader.shader);

            console.log("copied shader...", this._boundShader.shader);
        }

        if (this._changedDefines) this._updateDefines();

        this._boundShader.shader.copyUniformValues(this._boundShader.orig);

        this._cgl.pushShader(this._boundShader.shader);
    }

    unbind()
    {
        if (this._boundShader) this._cgl.popShader();
        this._boundShader = null;
    }

    _addModulesToShader(shader)
    {
        let firstMod;
        if (this._mods.length > 1)firstMod = this._mods[0];
        for (let i = 0; i < this._mods.length; i++)
            shader.addModule(this._mods[i], firstMod);
    }

    addModule(mod)
    {
        this._mods.push(mod);
    }

    addUniform(type, name, valOrPort, v2, v3, v4)
    {
        this._uniforms.push();
    }

    _getDefineName(name)
    {
        const prefix = this._mods[0].group;
        if (name.indexOf("MOD_") == 0)
        {
            name = name.substr("MOD_".length);
            name = "mod" + prefix + name;
            console.log("name", name);
        }
        return name;
    }

    _updateDefinesShader(shader)
    {
        for (const i in this._defines)
        {
            const name = this._getDefineName(i);
            shader.define(name, this._defines[i]);
        }

        for (const i in this._definesToggled)
        {
            const name = this._getDefineName(i);
            shader.toggleDefine(name, this._definesToggled[i]);
        }
    }

    _updateDefines()
    {
        for (const j in this._shaders)
            this._updateDefinesShader(this._shaders[j].shader);

        this._changedDefines = false;
    }

    define(what, value)
    {
        this._defines[what] = value;
        this._changedDefines = true;
    }

    toggleDefine(name, b)
    {
        this._changedDefines = true;
        // mod.toggleDefine("MOD_GREEN",green.get());
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
