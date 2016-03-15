# Embedding Patches

*cables*-Patches can be exported as a zip-file and embedded into any website. The size of the exported patches are relatively small as only the ops which you use in your patch are packed into the zip-file. 

- In your project settings click `Export Static Archive`
- A *.zip*-archive containing all your project data is created
- The archive contains an `index.html`-file – put this on a web-server and load it, your project should be shown. You can open your browser’s developer tools to check if there are any errors.

## Parameters

- `glCanvasId` (string): The element ID of your canvas object
- `prefixAssetPath` (string): Path where to find the assets folder
- `onError` (function): Function to be called if a critical error occurs (e.g. browser has no WebGL / Web Audio)
- `silent` (bool): Enable / disable all logging to console.

## Embedding Multiple Projects On A Page

This example shows two projects on one page. The projects are loaded one after another.

```
function loadScene1()
{
    var scene=new Scene(
    {
        glCanvasId:'glcanvas1',
        prefixAssetPath:'/myabsolutepath/'
    });

    CABLES.ajax('js/digital_bisquit20.json',function(err,data)
    {
        scene.deSerialize(JSON.parse(data)); 
    });
    scene.timer.play();
}

function loadScene2()
{
    // remove callback to not load it twice...
    CGL.onLoadingAssetsFinished=null;

    var scene2=new Scene(
    {
        glCanvasId:'glcanvas2',
        prefixAssetPath:'blahund/'
    });

    CABLES.ajax('js/digital_bisquit28.json',function(err,data)
    {
        scene2.deSerialize(JSON.parse(data)); 
    });
    scene2.timer.play();
}

document.addEventListener("DOMContentLoaded", function(event)
{
    // insert 2 canvas elements...
    var canv = document.createElement('canvas');
    canv.setAttribute("id", "glcanvas1");
    document.body.appendChild(canv);

    var canv2 = document.createElement('canvas');
    canv2.setAttribute("id", "glcanvas2");
    document.body.appendChild(canv2);

    // setup callback to load scene 2 after everithing for the first scene is loaded and playing...
    CGL.onLoadingAssetsFinished=loadScene2;

    // start loading scene 1
    loadScene1();
});
```