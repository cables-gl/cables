let update = op.inTrigger("Update");
let cgl = op.patch.cgl;

let lastScene = null;

update.onTriggered = function ()
{
    if (!cgl.frameStore.currentScene || !cgl.frameStore.currentScene.getValue()) return;

    if (lastScene != cgl.frameStore.currentScene)
    {
        lastScene = cgl.frameStore.currentScene;
        let meshes = cgl.frameStore.currentScene.getValue().meshes;
        for (let i = 0; i < meshes.length; i++)
        {
            console.log("name", meshes[i]);
        }
    }
};
