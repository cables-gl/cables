const inNum = op.inBool("Boolean", 0);

op.setUiAttrib({ "height": 100, "width": 100, "resizable": true });

op.renderPreviewLayer = (ctx, pos, size) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        pos[0], pos[1],
        size[0], size[1]);

    const sc = 1000 / gui.patchView._patchRenderer.viewBox.zoom * 1.5;

    let v = !!inNum.get();

    let circle = new Path2D(); // <<< Declaration
    let radius = size[1] / 2.4;
    if (radius < 0)radius = 0;
    circle.arc(pos[0] + size[0] / 2, pos[1] + size[1] / 2, radius * 0.8, 0, 2 * Math.PI, false);

    ctx.strokeStyle = "#555";
    ctx.lineWidth = 7 * sc;
    ctx.stroke(circle);

    if (v)
    {
        ctx.fillStyle = "#ccc";
        let circle = new Path2D(); // <<< Declaration
        circle.arc(pos[0] + size[0] / 2, pos[1] + size[1] / 2, radius / 1.5, 0, 2 * Math.PI, false);
        ctx.fill(circle);
    }
};
