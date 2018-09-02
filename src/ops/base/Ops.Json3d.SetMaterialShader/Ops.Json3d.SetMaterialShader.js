const exe=op.inFunction("exe");
const key=op.inValueString("Key");
const next=op.outFunction("trigger");

var cgl=op.patch.cgl;
var mat=null;

exe.onTriggered=function()
{
    if(!cgl.frameStore || !cgl.frameStore.currentScene || !cgl.frameStore.currentScene.replaceMaterials)
    {
        next.trigger();
        return;
    }
    
    var replMats=cgl.frameStore.currentScene.replaceMaterials;
    if(replMats)
    {
        if(!mat)
        {
            mat=replMats[key.get()];
        }

        if(mat)
        {
            cgl.setShader(mat);
            if(mat.bindTextures) mat.bindTextures();
            next.trigger();
            cgl.setPreviousShader();
        }
    }

    
};