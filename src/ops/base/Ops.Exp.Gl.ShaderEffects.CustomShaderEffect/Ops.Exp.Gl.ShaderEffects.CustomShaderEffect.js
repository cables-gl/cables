const render=op.addInPort(new CABLES.Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
const fragHead=op.addInPort(new CABLES.Port(op,"Fragment Head",CABLES.OP_PORT_TYPE_VALUE,{display:'editor',editorSyntax:'glsl'}));
const fragBody=op.addInPort(new CABLES.Port(op,"Fragment Main",CABLES.OP_PORT_TYPE_VALUE,{display:'editor',editorSyntax:'glsl'}));
const next=op.outFunction("Next");

const cgl=op.patch.cgl;
var shader=null;
var moduleFrag=null;
var moduleVert=null;
var reInitShader=true;
var uniformInputs=[];
var uniformTextures=[];

render.onLinkChanged=removeModule;
fragHead.onChange=fragBody.onChange=updateShaderModuleCode;

var needsUpdate=true;

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
    uniformInputs.length=0;
    uniformTextures.length=0;
    
    //todo remove those uniform ports again from op!!
}

function updateShaderModuleCode()
{
    reInitShader=true;    
}

render.onTriggered=function()
{
    if(!cgl.getShader())
    {
        op.trigger.trigger();
        return;
    }

    if(cgl.getShader()!=shader || reInitShader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();

        if(!shader)return;
        moduleFrag=shader.addModule(
            {
                title:op.objName+'.frag',
                name:'MODULE_COLOR',
                srcHeadFrag:fragHead.get(),
                srcBodyFrag:fragBody.get()
            },moduleVert);

        needsUpdate=true;

        reInitShader=false;
        
    }

    if(!shader)return;
    
    if(needsUpdate)updateShader();
    
    next.trigger();
};


function bindTextures()
{
    for(var i=0;i<uniformTextures.length;i++)
    {
        if(uniformTextures[i] && uniformTextures[i].get() && uniformTextures[i].get().tex)
        {
            /* --- */cgl.setTexture(0+i+3,uniformTextures[i].get().tex);
            // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, uniformTextures[i].get().tex);
        }
    }
}

function hasUniformInput(name)
{
    var i=0;
    for(i=0;i<uniformInputs.length;i++) if(uniformInputs[i].name==name)return true;
    for(i=0;i<uniformTextures.length;i++) if(uniformTextures[i].name==name)return true;
    return false;
}

function updateShader()
{
    // if(!shader)return;
    // needsUpdate=false;
    if(!shader.getProgram())return;
    
    needsUpdate=false;
    // op.log('shader update!',shader.getProgram());
    // console.log(shader);
    // shader.glslVersion=0;
    shader.bindTextures=bindTextures.bind(this);

    // shader.setSource(vertexShader.get(),fragmentShader.get());
    // shader.compile();

    var activeUniforms = cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_UNIFORMS);

    var i=0;
    var countTexture=0;
    for (i=0; i < activeUniforms; i++)
    {
        var uniform = cgl.gl.getActiveUniform(shader.getProgram(), i);

        if(!hasUniformInput(uniform.name))
        {
            if(uniform.type==0x1406) // float 
            {
                var newInput=op.inValue(uniform.name, 0);
                newInput.onChange=function(p,p2)
                {
                    p.uniform.needsUpdate=true;
                    p.uniform.setValue(p.get());
                };
                
                uniformInputs.push(newInput);
                newInput.uniform=new CGL.Uniform(shader,'f',uniform.name,newInput.get());
            }
            else
            if(uniform.type==0x8B5E ) // texture
            {
                var newInputTex=op.inObject(uniform.name);
                newInputTex.uniform=new CGL.Uniform(shader,'t',uniform.name,3+countTexture);
                uniformTextures.push(newInputTex);
                countTexture++;
            }
            else
            {
                console.log('unknown uniform type',uniform.type,uniform);
            }
        }
    }

    for(i=0;i<uniformInputs.length;i++)
    {
        uniformInputs[i].uniform.needsUpdate=true;
    }

    if(CABLES.UI) gui.patch().showOpParams(op);

    // outShader.set(null);
    // outShader.set(shader);

}
