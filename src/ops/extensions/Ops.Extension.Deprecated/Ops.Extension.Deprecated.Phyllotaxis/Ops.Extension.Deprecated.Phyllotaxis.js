const exec = op.inTrigger("Render");
const inNum = op.inValue("Num", 400);
const inC = op.inValue("Scale", 0.1);

const next = op.outTrigger("Next");
const outX = op.outValue("X");
const outY = op.outValue("Y");
const outI = op.outValue("Index");

exec.onTriggered = function ()
{
    let n = inNum.get();
    let c = inC.get();

    for (let i = 0; i < n; i++)
    {
        let a = i * 137.5;
        let r = c * Math.sqrt(i);
        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        let hu = i;
        // var hu=Math.sin( i * 0.5);
        hu = i / 3.0 % 360;
        // fill(hu, 255, 255);
        // noStroke();
        // ellipse(x, y, 4, 4);
        outX.set(x);
        outY.set(y);
        outI.set(i);
        next.trigger();
    }
};
