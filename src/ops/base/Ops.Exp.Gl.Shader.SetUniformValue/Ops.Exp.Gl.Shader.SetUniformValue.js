const inRender=op.inTrigger("Render");
const inSelect=op.inValueSelect("Uniform");
const inValue=op.inValue("Value");
const next=op.outTrigger("Next");

var shader=null;
const cgl=op.patch.cgl;
var doSetupUniform=true;
var uniform=null;
var shaderLastCompile=-1;

inRender.onTriggered=function()
{
    if(cgl.getShader() && ( shader!=cgl.getShader() || shader.lastCompile!=shaderLastCompile ) )
    {
        shader=cgl.getShader();
        setupShader();
        doSetupUniform=true;
    }
    
    if(doSetupUniform) setupUniform();
    
    if(uniform)
    {
        var oldValue=uniform.getValue();
        uniform.setValue(inValue.get());
        next.trigger();
        uniform.setValue(oldValue);
    }
    else
    {
        next.trigger();
    }
};

inSelect.onChange=function()
{
    doSetupUniform=true;    
};

function setupUniform()
{
    if(shader)
    {
        uniform=shader.getUniform(inSelect.get());
        // console.log('uniform!!!',uniform);
        
        if(!uniform) op.uiAttr({'error':'uniform unknown. maybe shader changed'});
            else op.uiAttr({'error':null});
            
        doSetupUniform=false;
    }
}

function setupShader()
{
    var unis=shader.getUniforms();
    // console.log('num uniforms',unis.length);
    shaderLastCompile=shader.lastCompile;
    var names=['none'];
    
    for(var i=0;i<unis.length;i++)
    {
        names.push( unis[i].getName() );
    }
    
    inSelect.setUiAttribs({values:names});
}
