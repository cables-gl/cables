# External triggers / functions

## Triggering cables ops from outside

Sometimes you need to trigger a cables-port from outside cables, e.g. when you embed a cables-patch into a website.

Using the op [Ops.Cables.Function](https://cables.gl/op/Ops.Cables.Function_v2) you can define a function name which is visble from outside cables, just give it a name by setting the input-port `Function Name`, e.g. `myFunction` and you can trigger the op from your website’s JavaScript-code using `CABLES.patch.config.myFunction();`

If you need to pass a parameter, you can set a cables variable first (see [Variables](../dev_embed_vars/dev_embed_vars)) and then trigger it.



## Calling external functions

If you want to call an external JavaScript-function from inside cables you need to define it as a property of `CABLES.patch.config`.

Let’s create a function `helloFromOutside()`:

In cables add the op `Callback`. Set its parameter `Callback Name` to `helloFromOutside`. Now connect a `Mouse` op to it so it gets triggered whenever the mouse was clicked (`Mouse – click` —> `Callback - exe`).

Export the project and open the `index.html` file in a text editor. Let’s define the function `helloFromOutside` right before the closing `script` tag:

```javascript
<script>
        function showError(err) {
            alert(err);
        }

        document.addEventListener('CABLES.jsLoaded', function(event) {
            CABLES.patch=new CABLES.Patch({
                patchFile: 'js/Callback_Example_Patch.json',
                prefixAssetPath: '',
                glCanvasId: 'glcanvas',
                glCanvasResizeToWindow: true,
                onError: showError
            });

            CABLES.patch.config.helloFromOutside = function(parameters) {
            	console.log('cables called... hello!?');
            };
        });
</script>
```

Start a local webserver to serve the website and open it in your browser.  Once you click the mouse on the canvas you should see `cables called... hello!?` inside the console.

If you pass any parameters with the `Callback`-op, these will be bundled as the `parameters`-array

### Testing external functions

If you want to test the above callback without leaving cables you can define a test-function in the browser console:

Open the developer tools by pressing `cmd + alt + i` and enter:

```javascript
gui.corePatch().config.helloFromOutside = function() {
    console.log('cables called... hello!?');
};
```

Based on the example above you should now be able to click somewhere on the canvas and see `cables called... hello!?` printed in the console.

*Summarising: Inside cables test-callbacks have to be defined as a property of `gui.corePatch().config`, in your outside JavaScript-code they must be defined as a property of `CABLES.patch.config`* .

