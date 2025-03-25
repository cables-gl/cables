const
    inNum = op.inFloat("Number", 0),
    outNum = op.outNumber("Passthrough");

op.setUiAttrib({ "height": 100, "width": 200, "resizable": true });

let max = -Number.MAX_VALUE;
let min = Number.MAX_VALUE;

inNum.onChange = () =>
{
    outNum.set(inNum.get());
};

inNum.onLinkChanged = () =>
{
    max = -Number.MAX_VALUE;
    min = Number.MAX_VALUE;
};

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y,
        layer.width, layer.height);

    // if(inDrawBar.get())
    {
        max = Math.max(max, inNum.get());
        min = Math.min(min, inNum.get());

        if (op.uiAttribs.color)ctx.fillStyle = op.uiAttribs.color;
        else ctx.fillStyle = "#555";

        let a = CABLES.map(0, min, max, 0, layer.width);
        let b = CABLES.map(inNum.get(), min, max, 0, layer.width);

        let xMin = Math.min(a, b);
        let xMax = Math.max(a, b);

        ctx.fillRect(
            xMin + layer.x, layer.y,
            xMax - xMin, layer.height);
    }

    // if(inDrawNUm.get())
    {
        const padding = 10;
        if (op.uiAttribs.color)ctx.fillStyle = "#fff";
        else ctx.fillStyle = "#ccc";

        const fontSize = layer.height * 0.7;
        ctx.font = "normal " + fontSize + "px sourceCodePro";
        ctx.fillText(Math.round(inNum.get() * 10000) / 10000, layer.x + padding, layer.y + fontSize);
    }
};
