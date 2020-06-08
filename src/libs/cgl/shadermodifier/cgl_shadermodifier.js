
class ShaderModifier
{
    constructor(cgl, options)
    {
        this._cgl = cgl;
        this._shaders = {};
        this._uniforms = [];
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
            console.log("copied shader...", this._boundShader.shader);
        }

        if (this._hasChanged)
        {

        }

        this._boundShader.shader.copyUniformValues(this._boundShader.orig);

        // console.log(this._boundShader.shader);

        this._cgl.pushShader(this._boundShader.shader);
    }

    unbind()
    {
        if (this._boundShader) this._cgl.popShader();
        this._boundShader = null;
    }

    addModule(mod)
    {
        let firstMod = null;
        if (this._mods.length > 0)firstMod = this._mods[0];
        for (const i in this._shaders)
        {
            this._shaders[i].addModule(mod, firstMod);
        }
        this._hasChanged = true;
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

    toggleDefine()
    {

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
