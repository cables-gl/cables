let update = op.inTrigger("Update");
let cgl = op.patch.cgl;

let lastScene = null;

update.onTriggered = function ()
{
    if (!cgl.tempData.currentScene || !cgl.tempData.currentScene.getValue()) return;

    if (lastScene != cgl.tempData.currentScene)
    {
        lastScene = cgl.tempData.currentScene;
        let meshes = cgl.tempData.currentScene.getValue().meshes;
        for (let i = 0; i < meshes.length; i++)
        {
            console.log("name", meshes[i]);
        }
    }
};
