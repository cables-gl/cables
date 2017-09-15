op.name="ShowShader";

var exec=op.inFunction("Exec");
var showFrag=op.inFunctionButton("Show Fragment");
var showVert=op.inFunctionButton("Show Vertex");
var showModules=op.inFunctionButton("Show Modules");

var next=op.outFunction("Next");

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
    shader=op.patch.cgl.getShader();
    next.trigger();

    
};

showModules.onTriggered=function()
{
    if(!shader)return;
    var mods=shader.getCurrentModules();
 

    CABLES.UI.MODAL.showCode('vertex shader',JSON.stringify(mods,false,4),"json");
};
