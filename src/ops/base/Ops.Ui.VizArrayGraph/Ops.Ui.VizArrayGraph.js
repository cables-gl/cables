const
    inArr = op.inArray("Array Numbers");

op.setUiAttrib({ "height": 100, "width": 200, "resizable": true });

const padding = 10;

inArr.onChange = () =>
{
    if (inArr) inArr.copyLinkedUiAttrib("stride", inArr);
};

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y,
        layer.width, layer.height);

    const arr = inArr.get();
    if (!arr) return;

    const colors = ["#7AC4E0", "#D183BF", "#9091D6", "#FFC395", "#F0D165", "#63A8E8", "#CF5D9D", "#66C984", "#D66AA6", "#515151"];

    let stride = inArr.uiAttribs.stride || 1;
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
};
