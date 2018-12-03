const exec=op.inTrigger("Trigger");
const inShader=op.inObject("Shader");

const next=op.outTrigger("Next");
const outShader=op.outObject("Result Shader");

var cgl=op.patch.cgl;
var shaderLastCompile=0;
var shader=null;
var uniformPorts=[];


op.onLoaded=function()
{
    if(op.portsInData)
    {
        for(var i=0;i<op.portsInData.length;i++)
        {
            for(var j=0;j<uniformPorts.length;j++)
            {
                if(uniformPorts[j].name==op.portsInData[i].name && op.portsInData[i].value!==undefined)
                {
                    uniformPorts[j].set(op.portsInData[i].value);
                }
            }
        }
    }
};

function setupPorts(uniforms)
{
    for(var i=0;i<uniforms.length;i++)
    {
        var p=null;
        for(var j=0;j<uniformPorts.length;j++)
            if(uniformPorts[j].name==uniforms[i].getName())
                p=uniformPorts[j];

        if(!p && uniforms[i].getType()=='f')
        {
            p=op.inValue(uniforms[i].getName(),uniforms[i].getValue());
        }
        else if(!p && uniforms[i].getType()=='t')
        {
            p=op.inTexture(uniforms[i].getName());
        }

        if(p)
        {
            p.uniform=uniforms[i];
            // console.log(p.name,p.uniform.getValue());
            uniformPorts[i]=p;
        }
    }
}

function resetUniforms()
{
    var uniforms=shader.getUniforms();
    for(var i=0;i<uniforms.length;i++)
    {
        var p=uniformPorts[i];
        if(!p)continue;
        p.uniform.setValue(p.oldValue);
    }
}

function bindTextures()
{
    if(oldBindTexture)oldBindTexture();

    var uniforms=shader.getUniforms();
    for(var i=0;i<uniforms.length;i++)
    {
        var p=uniformPorts[i];
        if(!p)continue;
        if(p.type==CABLES.OP_PORT_TYPE_TEXTURE)
        {
            const slot=p.uniform.getValue();
            p.oldValue=p.uniform.getValue();
            
            if(p.get())
            {
                cgl.setTexture(0+slot,p.get().tex);
                // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, p.get().tex);
            }
        }
    }
}

function setUniforms()
{
    
    var uniforms=shader.getUniforms();
    for(var i=0;i<uniforms.length;i++)
    {
        var p=uniformPorts[i];
        if(!p)continue;
        if(p.type!=CABLES.OP_PORT_TYPE_TEXTURE)
        {
            p.oldValue=p.uniform.getValue();
            p.uniform.setValue(p.get());
        }
    }
}

var oldBindTexture=null;

exec.onTriggered=function()
{
    if(!shader)return;
    
    cgl.setShader(shader);

    if(shaderLastCompile!=shader.lastCompile)
    {
        console.log('shader has changed...');
        resetShader();
    }

    if(shader.bindTextures)
    {
        oldBindTexture=shader.bindTextures;
        shader.bindTextures=bindTextures;
    }
    // if(shader.bindTextures) shader.bindTextures();
    setUniforms();
    next.trigger();
    
    shader.bindTextures=oldBindTexture;
    resetUniforms();
    
    cgl.setPreviousShader();
};

inShader.onChange=resetShader;

function resetShader()
{
    shader=inShader.get();

    if(!shader)
    {
        console.log("RESET!!!");
        return;
    }

    var unis=shader.getUniforms();

    shaderLastCompile=shader.lastCompile;

    setupPorts(unis);
    
    // remove unneeded ports...
    for(var i=0;i<uniformPorts.length;i++)
    {
        var foundUni=false;
        for(var j=0;j<unis.length;j++)
        {
            if(uniformPorts[i].name!=unis[j].getName())
            {
                foundUni=true;
            }
        }
    
        if(!foundUni)
        {
            console.log('found port to remove',uniformPorts[i].name);
            uniformPorts[i].remove();
        }


    }
    
    outShader.set(shader);
}