const
    inNum = op.inBool("Boolean", 0),
    outBool = op.outBoolNum("Bool");

op.setUiAttrib({ "height": 100, "width": 100, "resizable": true });

inNum.onChange = () =>
{
    outBool.set(inNum.get());
};

op.renderVizLayer = (ctx, layer) =>
{
    if (layer.width <= 0 || layer.height <= 0) return;

    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    let isTrue = !!inNum.get();

    let circle = new Path2D();
    let radius = Math.min(layer.height, layer.width) / 2.4 * 0.8;
    if (radius < 0)radius = 0;
    circle.arc(layer.x + layer.width / 2, layer.y + layer.height / 2, radius, 0, 2 * Math.PI, false);

    ctx.strokeStyle = "#555";
    ctx.lineWidth = 7 * layer.scale;
    ctx.stroke(circle);

    if (isTrue)
    {
        if (op.uiAttribs.color)ctx.fillStyle = op.uiAttribs.color;
        else ctx.fillStyle = "#ccc";

        let circle = new Path2D();
        circle.arc(layer.x + layer.width / 2, layer.y + layer.height / 2, radius - (ctx.lineWidth / 2), 0, 2 * Math.PI, false);
        ctx.fill(circle);
    }
};
