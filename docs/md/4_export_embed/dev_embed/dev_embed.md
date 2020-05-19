# Embedding Patches

*cables*-Patches can be exported as a zip-file and embedded into any website. The size of the exported patches are relatively small as only the ops which you use in your patch are packed into the zip-file.

- In your project settings click `Export Static Archive`
- A *.zip*-archive containing all your project data is created
- The archive contains an `index.html`-file – put this on a web-server and load it, your project should be shown. You can open your browser’s developer tools to check if there are any errors.
- An easy way to start a local web-server on your computer is by using a program like [anvil](anvilformac.com) – after you downloaded the zip file of your project and unpacked it, just drag the extracted folder onto the menu bar icon of *anvil* and click on the newly created local web-server to open it in your browser

## Examples

Have a look at our github example repository: [github](https://github.com/cables-gl/cables-embedding)

## Simple: Insert patch into an HTML container element

use `CABLES.EMBED.addPatch(...)` to create a canvas element and insert it into a container element. You can then set the Size of the container Element and the canvas will be resized automatically.

```html
<html>
<head>
    <title>cables</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style type="text/css">
        #mypatch
        {
            width:800px;
            height:480px;
        }
    </style>
</head>
<body>
    <div id="mypatch"></div>

    <script type="text/javascript" src="js/libs.core.min.js"></script>
    <script type="text/javascript" src="js/cables.min.js"></script>
    <script type="text/javascript" src="js/ops.js"></script>

    <script>
        CABLES.EMBED.addPatch("mypatch",
        {
            patchFile:'js/city.json',
            prefixAssetPath:''
        });
    </script>
</body>
</html>

```


## Advanced: Create Canvas and Patch

Create the Canvas Element yourself. Load the Patch and use the canvas id as parameter. Cables will then use this canvas. The Canvas is not resized automatically.
You should subscribe to the `CABLES.jsLoaded` event to initialize the patch, this assures all the javascript is loaded (even when loading "async").

```html
<html>
<head>
    <title>cables</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
</head>
<body>

    <canvas id="glcanvas" width="800" height="480"></canvas>

    <script type="text/javascript" src="js/libs.core.min.js" async></script>
    <script type="text/javascript" src="js/cables.min.js" async></script>
    <script type="text/javascript" src="js/ops.js" async></script>

    <script>

        var patch=null

        document.addEventListener("CABLES.jsLoaded", function(event)
        {
            patch=new CABLES.Patch(
            {
                patchFile:'js/city.json',
                prefixAssetPath:'',
                glCanvasId:'glcanvas',
                onError:alert
            });
        });


    </script>
</body>
</html>
```

### Pausing the Patch

For performance Reasons, you should pause the patch, when its not visible using`patch.pause()` . To Resume rendering use `patch.resume()`

## Patch Option Parameters

- `canvas` canvas context attributes (see https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext)
- `glCanvasId` (string): The element ID of your canvas object
- `prefixAssetPath` (string): Path where to find the assets folder
- `onError` (function): Function to be called if a critical error occurs (e.g. browser has no WebGL / Web Audio)
- `onFinishedLoading`: Function to be called when cables is done loading the patch and all assets
- `silent` (bool): Enable / disable all logging to console.
- `glCanvasResizeToWindow` Resize the Canvas to the size of the window
- `glCanvasResizeToParent` Resize the Canvas to the size of the parent (container) element





# Transparent Patch

make sure `clear` checkbox is NOT checked in mainloop.

in patch options set the following canvas context attributes:

```
canvas:{
    alpha:true,
    premultipliedAlpha:true
}
```
