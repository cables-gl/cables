const
    exec=op.inTrigger("Exec"),
    showFrag=op.inTriggerButton("Show Fragment"),
    showVert=op.inTriggerButton("Show Vertex"),
    showModules=op.inTriggerButton("Show Modules"),
    next=op.outTrigger("Next"),
    outName=op.outValueString("Name"),
    outNumUniforms=op.outValue("Num Uniforms"),
    outNumAttributes=op.outValue("Num Attributes"),
    outAttributeNames=op.outArray("Arributes Names"),
    outDefines=op.outArray("Num Defines");

const cgl=op.patch.cgl;
var shader=null;

showFrag.onTriggered=function()
{
    if(CABLES.UI && shader)
    {
        CABLES.UI.MODAL.showCode('fragment shader',shader.finalShaderFrag,"GLSL");
    }
};

showVert.onTriggered=function()
{
    if(CABLES.UI && shader)
    {
        CABLES.UI.MODAL.showCode('vertex shader',shader.finalShaderVert,"GLSL");
    }
};

exec.onTriggered=function()
{
    shader=cgl.getShader();
    next.trigger();

    if(shader && shader.getProgram())
    {
        var activeUniforms=cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_UNIFORMS);
        outNumUniforms.set(activeUniforms);
        outNumAttributes.set(cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_ATTRIBUTES));

    // var uniFloats=0;
    // for (var i=0; i < activeUniforms; i++) {
    //     var uniform = cgl.gl.getActiveUniform(shader.getProgram(), i);
    //     console.log(uniform)
    //     var floats=0;
    //     uniSize += uniform.size;
    // }

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

        op.setUiError("programnull",null);
    }
    else
    {
        op.setUiError("programnull",'No shader found');
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
