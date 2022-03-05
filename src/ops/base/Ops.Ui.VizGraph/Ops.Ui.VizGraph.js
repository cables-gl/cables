const
    inNum1 = op.inFloat("Number 1"),
    inNum2 = op.inFloat("Number 2"),
    inNum3 = op.inFloat("Number 3"),
    inNum4 = op.inFloat("Number 4"),
    inNum5 = op.inFloat("Number 5"),
    inNum6 = op.inFloat("Number 6"),
    inNum7 = op.inFloat("Number 7"),
    inNum8 = op.inFloat("Number 8"),
    inReset = op.inTriggerButton("Reset");

op.setUiAttrib({ "height": 150, "resizable": true });

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

op.renderPreviewLayer = (ctx, pos, size) =>
{
    const perf = CABLES.UI.uiProfiler.start("previewlayer graph");

    const colors = [
        "#00ffff",
        "#ffff00",
        "#ff00ff",
        "#0000ff",
        "#00ff00",
        "#ff0000",
        "#ffffff",
        "#888888",
    ];

    ctx.fillStyle = "#222";
    ctx.fillRect(
        pos[0],
        pos[1],
        size[0],
        size[1]
    );

    for (let p = 0; p < op.portsIn.length; p++)
    {
        if (!op.portsIn[p].isLinked()) continue;
        const newVal = op.portsIn[p].get();

        max = Math.max(op.portsIn[p].get(), max);
        min = Math.min(op.portsIn[p].get(), min);

        if (!buff[p]) buff[p] = [];
        buff[p].push(newVal);
        if (buff[p].length > 60) buff[p].shift();

        const texSlot = 5;
        const mulX = size[0] / 60;

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#555555";

        ctx.beginPath();
        ctx.moveTo(pos[0], CABLES.map(0, min, max, size[1], 0) + pos[1]);
        ctx.lineTo(pos[0] + size[0], CABLES.map(0, min, max, size[1], 0) + pos[1]);
        ctx.stroke();

        ctx.strokeStyle = colors[p];

        ctx.beginPath();

        for (let i = 0; i < buff[p].length; i++)
        {
            let y = buff[p][i];

            y = CABLES.map(y, min, max, size[1], 0);
            y += pos[1];
            if (i == 0)ctx.moveTo(pos[0], y);
            else ctx.lineTo(pos[0] + i * mulX, y);
        }

        ctx.stroke();
    }

    ctx.fillStyle = "#888";
    ctx.fillText("max:" + Math.round(max * 100) / 100, pos[0] + 10, pos[1] + size[1] - 10);
    ctx.fillText("min:" + Math.round(min * 100) / 100, pos[0] + 10, pos[1] + size[1] - 30);

    perf.finish();
};
