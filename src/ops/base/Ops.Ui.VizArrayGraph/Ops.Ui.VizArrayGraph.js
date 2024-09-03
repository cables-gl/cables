const
    inArr = op.inArray("Array Numbers"),
    inCurve = op.inBool("Curve", false);

op.setUiAttrib({ "height": 100, "width": 200, "resizable": true });

const padding = 10;

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y,
        layer.width, layer.height);

    const arr = inArr.get();
    if (!arr) return;

    const colors = ["#d1838e", "#95d183", "#7AC4E0", "#D183BF", "#9091D6", "#FFC395", "#F0D165", "#63A8E8", "#CF5D9D", "#66C984", "#D66AA6", "#515151"];

    let stride = 1;

    if (inArr.links.length > 0 && inArr.links[0].getOtherPort(inArr))
        stride = inArr.links[0].getOtherPort(inArr).uiAttribs.stride || 1;

    let max = -Number.MAX_VALUE;
    let min = Number.MAX_VALUE;
    let num = arr.length;
    let mulX = layer.width / ((num - stride) / stride);

    for (let i = 0; i < arr.length; i++)
    {
        let v = arr[i];

        min = Math.min(v, min);
        max = Math.max(v, max);
    }

    {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#444";
        ctx.beginPath();
        let y = CABLES.map(0, min, max, layer.height - 3, 3) + layer.y;
        ctx.moveTo(layer.x, y);
        ctx.lineTo(layer.x + layer.width, y);
        ctx.stroke();
    }

    if (inCurve.get())
        for (let st = 0; st < stride; st++)
        {
            ctx.lineWidth = 2;
            ctx.strokeStyle = colors[st];

            ctx.beginPath();

            for (let i = st; i < arr.length; i += stride)
            {
                let y = arr[i];

                y = CABLES.map(y, min, max, layer.height - 3, 3);
                y += layer.y;
                if (i === st)ctx.moveTo(layer.x, y);
                else ctx.lineTo(layer.x + (i - st) / stride * mulX, y);
            }

            ctx.stroke();
        }

    if (!inCurve.get())
    {
        if (stride != 1)ctx.globalAlpha = 0.75;
        for (let st = 0; st < stride; st++)
        {
            for (let i = st; i < arr.length; i += stride)
            {
                let y = arr[i];

                ctx.fillStyle = colors[st];
                // ctx.fillStyle = "rgb(255 0 0 / 50%)";

                y = CABLES.map(y, min, max, layer.height - 3, 3);
                const y0 = CABLES.map(0, min, max, layer.height - 3, 3);

                const ymin = Math.min(y, y0);
                const ymax = Math.max(y, y0);

                ctx.fillRect(layer.x + (i - st) / stride * mulX, layer.y + ymin, Math.floor(mulX) - 1, (ymax - ymin));
            }
        }

        ctx.globalAlpha = 1.0;
    }
};
