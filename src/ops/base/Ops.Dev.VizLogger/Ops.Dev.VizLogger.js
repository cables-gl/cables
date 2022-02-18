const inNum=op.inFloat("Number",0);
const inString=op.inString("String","");

let lines=10;
const arr=[];

inString.onChange=()=>
{
    arr.push(""+inString.get());
};

inNum.onChange=()=>
{
    arr.push(""+inNum.get());
};

op.setUiAttrib({ "height": 200, "width":400, "resizable": true });

op.renderPreviewLayer = (ctx, pos, size) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(
        pos[0], pos[1],
        size[0], size[1] );

    const sc = 1000 / gui.patchView._patchRenderer.viewBox.zoom * 1.5;

    ctx.save();
    ctx.scale(sc, sc);

    ctx.font = "normal 10px sourceCodePro";
    ctx.fillStyle = "#ccc";

    if(lines>0)while(arr.length-1>lines) arr.shift();

    lines = Math.floor(size[1] / sc / 10 - 1);
    let padding = 4;

    ctx.fillStyle = "#ccc";

    for (let i = Math.min(lines,arr.length-1); i >0; i--)
    {
        ctx.fillText(arr[i], pos[0] / sc + padding, pos[1] / sc + 10 * i + padding);
    }

    ctx.restore();
};
