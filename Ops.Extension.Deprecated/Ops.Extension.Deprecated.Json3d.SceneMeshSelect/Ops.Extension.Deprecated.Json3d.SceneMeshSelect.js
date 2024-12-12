let update = op.inTrigger("Update");
let cgl = op.patch.cgl;

let lastScene = null;

update.onTriggered = function ()
{
    if (!cglframeStorecurrentScene || !cglframeStorecurrentScene.getValue()) return;

    if (lastScene != cglframeStorecurrentScene)
    {
        lastScene = cglframeStorecurrentScene;
        let meshes = cglframeStorecurrentScene.getValue().meshes;
        for (let i = 0; i < meshes.length; i++)
        {
            console.log("name", meshes[i]);
        }
    }
};
