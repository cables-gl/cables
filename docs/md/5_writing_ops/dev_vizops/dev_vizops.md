# Creating Viz Ops

## viz ops can be used to easily visualize stuff in the patchfield.

You can use the canvas drawing API to draw things in the patchfield 
--> https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

There is quite a variety of viz ops in cables already, take a [look](https://cables.gl/ops/Ops.Ui)


To make an op a viz op, you have to implement the function renderVizLayer:

```
op.renderVizLayer = (ctx, layer) =>
{
};
```

If exists, this function will be calles when an update is needed.

parameters:
- ctx is the 2d drawing context
- layer contains information about the current op size,scale and positioning, for example:

```
{
    "x":0,
    "y":0,
    "width":200, 
    "height":200 
}
```
x,y is your topleft corner where you start drawing
width,height is the size of the canvas of your op 

Have a look at this example op: [Ops.Templates.ExampleVizOp](https://cables.gl/op/Ops.Templates.ExampleVizOp)


```
const
    inNum = op.inFloat("Number", 23);

op.setUiAttrib({ "height": 200, "width": 200, "resizable": true });


op.renderVizLayer = (ctx, layer) =>
{

    // clear the canvas in a dark grey color
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y,
        layer.width, layer.height);

    const padding = 10;

    ctx.fillStyle = "#05f";

    // draw a circle with a radius of the height of our op canvas
    let circle = new Path2D();
    circle.arc(layer.x + layer.height / 2, layer.y + layer.height / 2, layer.height/2, 0, 2 * Math.PI, false);
    ctx.fill(circle);


    // draw text, use layer height for fontsize, so it is fixed when resizing the op or zooming the patch
    ctx.fillStyle = "#fff";
    const fontSize = layer.height * 0.7;
    ctx.font = "normal " + fontSize + "px sourceCodePro";
    ctx.fillText(Math.round(inNum.get() * 10000) / 10000, layer.x + padding, layer.y + fontSize);
    
    
    // this text will not scale and be at fixed size when zooming in/out
    ctx.font = "normal " + 12 + "px sourceCodePro";
    ctx.fillText(Math.round(inNum.get() * 10000) / 10000, layer.x + padding, layer.y+20);


};
```
