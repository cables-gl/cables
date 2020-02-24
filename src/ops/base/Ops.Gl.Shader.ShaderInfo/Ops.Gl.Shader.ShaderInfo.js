const
    exec=op.inTrigger("Exec"),
    showFrag=op.inTriggerButton("Show Fragment"),
    showVert=op.inTriggerButton("Show Vertex"),
    showModules=op.inTriggerButton("Show Modules"),
    next=op.outTrigger("Next"),
    outName=op.outString("Name"),
    outNumUniforms=op.outValue("Num Uniforms"),
    outNumAttributes=op.outValue("Num Attributes"),
    outAttributeNames=op.outArray("Arributes Names"),
    outDefines=op.outArray("Num Defines");

const cgl=op.patch.cgl;
var shader=null;

showFrag.onTriggered=function()
{
    if(CABLES.UI && shader) CABLES.UI.MODAL.showCode('fragment shader',shader.finalShaderFrag,"GLSL");
};

showVert.onTriggered=function()
{
    if(CABLES.UI && shader) CABLES.UI.MODAL.showCode('vertex shader',shader.finalShaderVert,"GLSL");
};

exec.onTriggered=function()
{
    shader=cgl.getShader();
    next.trigger();

    shader.bind();

    if(!shader.getProgram()) op.setUiError("prognull",'Shader is not compiled');
    else op.setUiError("prognull",null);

    if(!shader) op.setUiError("noshader",'No Shader..');
    else op.setUiError("noshader",null);

    if(shader &&  shader.getProgram())
    {
        var activeUniforms=cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_UNIFORMS);
        outNumUniforms.set(activeUniforms);
        outNumAttributes.set(cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_ATTRIBUTES));

        var i=0;
        var attribNames=[];
        for (i=0;i<cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_ATTRIBUTES);i++)
        {
            var name = cgl.gl.getActiveAttrib(shader.getProgram(), i).name;
            attribNames.push(name);
        }
        outAttributeNames.set(attribNames);
        outDefines.set(shader.getDefines());
        outName.set(shader.getName());

        op.setUiError("prognull",null);
    }
    else
    {
        outNumUniforms.set(0);
        outNumAttributes.set(0);
        outDefines.set(0);
        outAttributeNames.set(null);
    }

};

showModules.onTriggered=function()
{
    if(!shader)return;
    var mods=shader.getCurrentModules();

    CABLES.UI.MODAL.showCode('vertex shader',JSON.stringify(mods,false,4),"json");
};
