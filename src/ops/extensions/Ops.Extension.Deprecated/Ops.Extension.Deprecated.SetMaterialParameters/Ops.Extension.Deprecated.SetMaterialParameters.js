const exec = op.inTrigger("Trigger");
const inShader = op.inObject("Shader");

const next = op.outTrigger("Next");
const outShader = op.outObject("Result Shader");

let cgl = op.patch.cgl;
let shaderLastCompile = 0;
let shader = null;
let uniformPorts = [];

op.onLoaded = function ()
{
    if (op.portsInData)
    {
        for (let i = 0; i < op.portsInData.length; i++)
        {
            for (let j = 0; j < uniformPorts.length; j++)
            {
                if (uniformPorts[j].name == op.portsInData[i].name && op.portsInData[i].value !== undefined)
                {
                    uniformPorts[j].set(op.portsInData[i].value);
                }
            }
        }
    }
};

function setupPorts(uniforms)
{
    for (let i = 0; i < uniforms.length; i++)
    {
        let p = null;
        for (let j = 0; j < uniformPorts.length; j++)
            if (uniformPorts[j].name == uniforms[i].getName())
                p = uniformPorts[j];

        if (!p && uniforms[i].getType() == "f")
        {
            p = op.inValue(uniforms[i].getName(), uniforms[i].getValue());
        }
        else if (!p && uniforms[i].getType() == "t")
        {
            p = op.inTexture(uniforms[i].getName());
        }

        if (p)
        {
            p.uniform = uniforms[i];
            uniformPorts[i] = p;
        }
    }
}

function resetUniforms()
{
    let uniforms = shader.getUniforms();
    for (let i = 0; i < uniforms.length; i++)
    {
        let p = uniformPorts[i];
        if (!p) continue;
        p.uniform.setValue(p.oldValue);
    }
}

function bindTextures()
{
    if (oldBindTexture)oldBindTexture();

    let uniforms = shader.getUniforms();
    for (let i = 0; i < uniforms.length; i++)
    {
        let p = uniformPorts[i];
        if (!p) continue;
        if (p.type == CABLES.OP_PORT_TYPE_TEXTURE)
        {
            const slot = p.uniform.getValue();
            p.oldValue = p.uniform.getValue();

            if (p.get())
            {
                cgl.setTexture(0 + slot, p.get().tex);
                // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, p.get().tex);
            }
        }
    }
}

function setUniforms()
{
    let uniforms = shader.getUniforms();
    for (let i = 0; i < uniforms.length; i++)
    {
        let p = uniformPorts[i];
        if (!p) continue;
        if (p.type != CABLES.OP_PORT_TYPE_TEXTURE)
        {
            p.oldValue = p.uniform.getValue();
            p.uniform.setValue(p.get());
        }
    }
}

var oldBindTexture = null;

exec.onTriggered = function ()
{
    if (!shader) return;

    cgl.pushShader(shader);

    if (shaderLastCompile != shader.lastCompile)
    {
        op.log("shader has changed...");
        resetShader();
    }

    if (shader.bindTextures)
    {
        oldBindTexture = shader.bindTextures;
        shader.bindTextures = bindTextures;
    }
    // if(shader.bindTextures) shader.bindTextures();
    setUniforms();
    next.trigger();

    shader.bindTextures = oldBindTexture;
    resetUniforms();

    cgl.popShader();
};

inShader.onChange = resetShader;

function resetShader()
{
    shader = inShader.get();

    if (!shader)
    {
        op.log("RESET!!!");
        return;
    }

    let unis = shader.getUniforms();

    shaderLastCompile = shader.lastCompile;

    setupPorts(unis);

    // remove unneeded ports...
    for (let i = 0; i < uniformPorts.length; i++)
    {
        let foundUni = false;
        for (let j = 0; j < unis.length; j++)
        {
            if (uniformPorts[i].name != unis[j].getName())
            {
                foundUni = true;
            }
        }

        if (!foundUni)
        {
            op.log("found port to remove", uniformPorts[i].name);
            uniformPorts[i].remove();
        }
    }

    outShader.set(shader);
}
