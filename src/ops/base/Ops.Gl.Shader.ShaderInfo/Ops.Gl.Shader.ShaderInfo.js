op.name="ShowShader";

var exec=op.inFunction("Exec");
var showFrag=op.inFunctionButton("Show Fragment");
var showVert=op.inFunctionButton("Show Vertex");
var showModules=op.inFunctionButton("Show Modules");


var next=op.outFunction("Next");

var outNumUniforms=op.outValue("Num Uniforms");
var outNumAttributes=op.outValue("Num Attributes");

var cgl=op.patch.cgl;

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

    if(shader)
    {
        if(shader.getProgram()!=null)outNumUniforms.set(cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_UNIFORMS));
            else outNumUniforms.set(0);
        if(shader.getProgram()!=null)outNumAttributes.set(cgl.gl.getProgramParameter(shader.getProgram(), cgl.gl.ACTIVE_ATTRIBUTES));
            else outNumAttributes.set(0);

        if(shader.getProgram()==null)op.error("programnull",'shader program is null');
            else op.error("programnull",null);

    }

};

showModules.onTriggered=function()
{
    if(!shader)return;
    var mods=shader.getCurrentModules();
 

    CABLES.UI.MODAL.showCode('vertex shader',JSON.stringify(mods,false,4),"json");
};
