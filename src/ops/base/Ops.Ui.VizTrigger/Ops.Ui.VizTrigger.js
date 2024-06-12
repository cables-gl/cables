const
    inTrigger = op.inTriggerButton("Trigger"),
    inReset = op.inTriggerButton("Reset"),
    outCount = op.outNumber("Count");

op.setUiAttrib({ "height": 100, "width": 130, "resizable": true });

let lastTime = 0;
let count = 0;

inReset.onTriggered = () =>
{
    count = 0;
    op.setUiAttrib({ "extendTitle": "_____" + String(count) });
    outCount.set(count);
};

inTrigger.onTriggered = () =>
{
    lastTime = performance.now();
    op.setUiAttrib({ "extendTitle": String(++count) });
    outCount.set(count);
};

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y,
        layer.width, layer.height);

    let radius = Math.min(layer.height, layer.width) / 2.4 * 0.8;
    let diff = performance.now() - lastTime;

    let v = CABLES.map(diff, 0, 100, 1, 0);

    ctx.globalAlpha = v + 0.3;
    ctx.fillStyle = "#ccc";

    let circle = new Path2D();

    const sizeAnim = v * 6;
    circle.arc(
        layer.x + layer.width / 2,
        layer.y + layer.height / 2,
        radius - (ctx.lineWidth / 2) + (sizeAnim * 2),
        0, 2 * Math.PI, false);
    ctx.fill(circle);

    ctx.globalAlpha = 1.0;
};
