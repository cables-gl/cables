



## embedding

- in your project settings click ```export static archive```
- a .zip archive is created, containing all your project data 
- the archive contains an index.html. put this on a webserver and load it, your project should be shown.

## parameters

- ```glCanvasId``` (string) the element id of your canvas object
- ```prefixAssetPath``` (string) path where to fins the assets folder
- ```onError``` (function) function to be called if a critical error occurs (e.g. browser has no webgl/webaudio)
- ```silent``` (bool) enable/disable all logging to console.


## embedding multiple projects on one page

this example shows two projects on one page. the projects are loaded one after another.

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