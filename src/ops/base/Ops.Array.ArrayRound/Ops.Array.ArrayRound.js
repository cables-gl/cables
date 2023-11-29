const inArray = op.inArray("In"),
    inMeth = op.inSwitch("Method", ["Nearest", "Floor", "Ceil"], "Nearest"),
    inDec = op.inInt("Decimal Places", 0),
    outArray = op.outArray("Result");

let newArr = [];
let decm = 1;
inDec.onChange = updateDecm;
inArray.onChange = exec;
outArray.set(newArr);

function updateDecm()
{
    decm = Math.pow(10, inDec.get());
    exec();
}

function exec()
{
    let arr = inArray.get();

    if (!arr)
    {
        outArray.set(null);
        return;
    }
    if (newArr.length != arr.length) newArr.length = arr.length;

    if (inMeth.get() == "Ceil")
        for (let i = 0; i < arr.length; i++)
            newArr[i] = Math.ceil(arr[i] * decm) / decm;

    else if (inMeth.get() == "Floor")
        for (let i = 0; i < arr.length; i++)
            newArr[i] = Math.floor(arr[i] * decm) / decm;

    else if (inMeth.get() == "Nearest")
        for (let i = 0; i < arr.length; i++)
            newArr[i] = Math.round(arr[i] * decm) / decm;

    outArray.setRef(newArr);
}
