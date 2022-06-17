const
    inNum = op.inFloat("Number", 23);

op.setUiAttrib({ "height": 200, "width": 200, "resizable": true });


op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y,
        layer.width, layer.height);

    const padding = 10;

    ctx.fillStyle = "#05f";

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
