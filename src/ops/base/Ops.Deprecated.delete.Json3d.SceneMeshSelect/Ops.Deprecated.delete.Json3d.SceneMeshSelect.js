
var update=op.inTrigger("Update");
var cgl=op.patch.cgl;

var lastScene=null;

update.onTriggered=function()
{
    
    if(!cgl.frameStore.currentScene || !cgl.frameStore.currentScene.getValue())return;

    if(lastScene!=cgl.frameStore.currentScene)
    {
        lastScene=cgl.frameStore.currentScene;
        var meshes=cgl.frameStore.currentScene.getValue().meshes;
        for(var i=0;i<meshes.length;i++)
        {
            console.log( 'name',meshes[i] );
        }
        
    }
    
};

