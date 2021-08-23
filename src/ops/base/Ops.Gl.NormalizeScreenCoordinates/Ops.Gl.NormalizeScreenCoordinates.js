

let inX = op.inValue("X");
let inY = op.inValue("Y");

let outX = op.outValue("Result X");
let outY = op.outValue("Result Y");

let range = op.inBool("-1 to 1");

inX.onChange = update;
inY.onChange = update;
range.onChange = update;


function update()
{
    let x = inX.get() / op.patch.cgl.canvas.width;
    let y = inY.get() / op.patch.cgl.canvas.height;

    outX.set(x);
    outY.set(y);

    if (range.get())
    {
        x = x * 2 - 1;
        y = y * 2 - 1;
    }

    outX.set(x);
    outY.set(y);
}
