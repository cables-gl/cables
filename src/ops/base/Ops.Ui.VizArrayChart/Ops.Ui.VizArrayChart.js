const
    inArr = op.inArray("Array Numbers"),
    inArrTitles = op.inArray("Titles");
    // inStyle = op.inSwitch("Style", ["Pie", "Graph"], "Pie");

op.setUiAttrib({ "height": 100, "width": 200, "resizable": true });

let max = -Number.MAX_VALUE;
let min = Number.MAX_VALUE;
const padding = 10;

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        layer.x, layer.y,
        layer.width, layer.height);

    const arr = inArr.get();
    const arrNames = inArrTitles.get();
    if (!arr)
    {
        return;
    }

    const colors = ["#7AC4E0", "#D183BF", "#9091D6", "#FFC395", "#F0D165", "#63A8E8", "#CF5D9D", "#66C984", "#D66AA6", "#515151"];

    let size = layer.height / 2;
    if (size != size || size < 0) return;
    let currentAngle = 0;
    let total = 0;
    for (let i = 0; i < arr.length; i++)
    {
        total += parseFloat(Math.abs(arr[i]));
    }

    let style = 0;
    // if (inStyle.get() === "Graph")style = 1;

    if (style == 0) // PIE
    {
        const fontSize = size / 10;
        ctx.font = "normal " + fontSize + "px sourceCodePro";

        ctx.fillStyle = "#fff";
        ctx.fillText("total sum:" + Math.round(total * 100) / 100, layer.x + (size * 2) + padding * 2, layer.y + fontSize);

        for (let i = 0; i < arr.length; i++)
        {
            let name = "";
            if (arrNames && arrNames[i])name = arrNames[i];
            let perc = (Math.abs(arr[i]) / total);
            let portionAngle = perc * 2 * Math.PI;

            ctx.beginPath();
            ctx.arc(layer.x + size, layer.y + size, Math.max(0, size - (padding * 2)), currentAngle, currentAngle + portionAngle);
            currentAngle += portionAngle;
            ctx.lineTo(layer.x + size, layer.y + size);

            ctx.fillStyle = colors[i % (colors.length - 1)];
            ctx.fill();

            ctx.fillText(i + ": " + name + " " + Math.round(perc * 1000) / 10 + "%", layer.x + (size * 2) + padding * 2, layer.y + fontSize * (i + 1 + 1));
        }

        ctx.beginPath();
        ctx.fillStyle = "#222";
        ctx.arc(layer.x + size, layer.y + size, size / 5, 0, 2 * Math.PI);
        ctx.fill();
    }
    else if (style == 1)
    {
        let posy = 0;
        for (let i = 0; i < arr.length; i++)
        {
            const perc = (Math.abs(arr[i]) / total);
            const h = perc * layer.height;

            ctx.fillStyle = colors[i % (colors.length - 1)];
            ctx.fillRect(
                layer.x + 21, layer.y + posy,
                12, h);
            posy += h;
        }
    }
};
