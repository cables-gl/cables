let inArr = op.inArray("Array");
let outArr = op.outArray("Result");

function compare(a, b)
{
    let xd = a[0] - b[0];
    let yd = a[1] - b[1];
    let zd = a[2] - b[2];

    return (Math.sqrt(xd * xd + yd * yd + zd * zd)) - 1.5;
}

let arrArr = [];

function sliceArray()
{
    let size = 3;
    arrArr.length = 0;
    let bigarray = inArr.get();
    for (let i = 0; i < bigarray.length; i += size)
    {
        arrArr.push(bigarray.slice(i, i + size));
    }
}

inArr.onChange = function ()
{
    if (!inArr.get()) return;
    sliceArray();

    arrArr.sort(compare);
    outArr.set(null);
    arrArr = [].concat.apply([], arrArr);

    outArr.set(arrArr);
};
