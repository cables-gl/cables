# Exporting Patches

*cables*-Patches can be exported as a zip-file, deployed to several servids, run standalone and be embedded into any website. 
The size of the exported patches are relatively small as only the ops which you use in your patch are packed into the zip-file.

- In the Editor choose `Export` in the menu to open the export dialog
- Use one of the following export services to export your patch:

    - [Export a ZIP file](export_zip/export_zip)
    - [Export to github (pages)](export_github/export_github)
    - [Export and deploy to netlify](export_netlify/export_netlify)
    - [Export creating a standalone executable](export_exe/export_exe)
    - [Export via Iframe](export_embed/export_embed)
    - [Export using the cables command line interface](export_cli/export_cli)

## Examples for Embedding

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

make sure `clear` checkbox is NOT checked in MainLoop.

in patch options set the following canvas context attributes:

```
canvas:{
    alpha:true,
    premultipliedAlpha:true
}
```
