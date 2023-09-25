const exec = op.inTrigger("Render");
const inNum = op.inValueInt("Num", 400);
const inC = op.inValue("Scale", 0.1);
const inI = op.inValue("Param", 100);

const outArr = op.outArray("Coordinates");

const arr = [];

inNum.onChange = update;
inC.onChange = update;
inI.onChange = update;

function update()
{
    arr.length = Math.floor(inNum.get() * 3);

    let n = inNum.get();
    let c = inC.get();

    let ii = inI.get();

    for (let i = 0; i < n; i++)
    {
        let a = i * ii;
        let r = c * Math.sqrt(i);
        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        let hu = i / 3.0 % 360;

        arr[i * 3 + 0] = x;
        arr[i * 3 + 1] = y;
        arr[i * 3 + 2] = 0;
    }
    outArr.setRef(arr);
}

update();
