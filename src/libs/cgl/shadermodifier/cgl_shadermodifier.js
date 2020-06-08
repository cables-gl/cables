
class ShaderModifier
{
    constructor(cgl, options)
    {
        this._cgl = cgl;
        this._shaders = {};
        this._uniforms = [];
        this._toggledDefines = {};
        this._mods = [];
        this._hasChanged = false;
        this._boundShader = null;
    }

    // setShader(s)
    // {
    //     if (this._shaders.indexOf(s) == -1) this._shaders.push(s);
    // }

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

            console.log("copied shader...", this._boundShader.shader);
        }

        if (this._hasChanged)
        {

        }

        if (this._changedDefines) this._updateDefines();

        this._boundShader.shader.copyUniformValues(this._boundShader.orig);

        // console.log(this._boundShader.shader);

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
        {
            shader.addModule(this._mods[i], firstMod);
        }
        // this._hasChanged = true;
    }

    addModule(mod)
    {
        this._mods.push(mod);
    }

    addToShader(shader)
    {
    }

    addUniform(type, name, valOrPort, v2, v3, v4)
    {
        this._uniforms.push();
    }

    define(what, value)
    {

    }

    _updateDefines()
    {
        const prefix = this._mods[0].group;
        for (const j in this._shaders)
        {
            for (const i in this._toggledDefines)
            {
                let name = i;
                console.log("name", name);
                if (name.indexOf("MOD_") == 0)
                {
                    name = name.substr("MOD_".length);
                    // console.log("MOD"+prefix)
                    name = "mod" + prefix + name;
                    console.log("name", name);
                    this._shaders[j].shader.toggleDefine(name, this._toggledDefines[i]);
                }
            }
        }
        this._changedDefines = false;
    }

    toggleDefine(name, b)
    {
        this._changedDefines = true;
        // mod.toggleDefine("MOD_GREEN",green.get());
        this._toggledDefines[name] = b;
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
