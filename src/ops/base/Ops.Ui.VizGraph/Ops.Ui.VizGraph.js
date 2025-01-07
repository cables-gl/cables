
const
    inNum1 = op.inFloat("Number 1"),
    inNum2 = op.inFloat("Number 2"),
    inNum3 = op.inFloat("Number 3"),
    inNum4 = op.inFloat("Number 4"),
    inNum5 = op.inFloat("Number 5"),
    inNum6 = op.inFloat("Number 6"),
    inNum7 = op.inFloat("Number 7"),
    inNum8 = op.inFloat("Number 8"),
    inFill = op.inBool("Fill Graph", true),
    inReset = op.inTriggerButton("Reset");

op.setUiAttrib({ "height": 150, "resizable": true, "vizLayerMaxZoom": 2500 });

let buff = [];

let max = -Number.MAX_VALUE;
let min = Number.MAX_VALUE;

inNum1.onLinkChanged =
    inNum2.onLinkChanged =
    inNum3.onLinkChanged =
    inNum4.onLinkChanged =
    inNum5.onLinkChanged =
    inNum6.onLinkChanged =
    inNum7.onLinkChanged =
    inNum8.onLinkChanged =
    inReset.onTriggered = () =>
    {
        max = -Number.MAX_VALUE;
        min = Number.MAX_VALUE;
        buff = [];
    };

op.renderVizLayer = (ctx, layer) =>
{
    const doFill = inFill.get();

    const colors = ["#7AC4E0", "#D183BF", "#9091D6", "#FFC395", "#F0D165", "#63A8E8", "#CF5D9D", "#66C984", "#D66AA6", "#515151"];

    let fontSize = 10 * layer.pixelDensity;
    ctx.font = "bold " + fontSize + "px sourceCodePro";
    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    for (let p = 0; p < op.portsIn.length; p++)
    {
        if (!op.portsIn[p].isLinked()) continue;
        const newVal = op.portsIn[p].get();

        max = Math.max(op.portsIn[p].get(), max);
        min = Math.min(op.portsIn[p].get(), min);

        if (!buff[p]) buff[p] = [];
        buff[p].push(newVal);
        if (buff[p].length > 60) buff[p].shift();

        const texSlot = 6;
        const mulX = layer.width / 60;

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#555555";

        ctx.beginPath();
        ctx.moveTo(layer.x, CABLES.map(0, min, max, layer.height, 0) + layer.y);
        ctx.lineTo(layer.x + layer.width, CABLES.map(0, min, max, layer.height, 0) + layer.y);
        ctx.stroke();

        ctx.beginPath();

        let y;

        for (let i = 0; i < buff[p].length; i++)
        {
            y = buff[p][i];

            y = CABLES.map(y, min, max, layer.height - 3, 3);
            y += layer.y;
            if (i === 0)ctx.moveTo(layer.x, y);
            else ctx.lineTo(layer.x + i * mulX, y);
        }

        if (doFill)
        {
            ctx.lineTo(layer.x + buff[p].length * mulX, layer.y + layer.height);
            ctx.lineTo(layer.x, layer.y + layer.height);
            ctx.fillStyle = colors[p];
            ctx.fill();
        }
        else
        {
            ctx.strokeStyle = colors[p];
            ctx.stroke();
        }
    }

    ctx.fillStyle = "#fff";
    ctx.fillText("max:" + Math.round(max * 100) / 100, layer.x + 10, layer.y + layer.height - 10);
    ctx.fillText("min:" + Math.round(min * 100) / 100, layer.x + 10, layer.y + layer.height - 30);
};
