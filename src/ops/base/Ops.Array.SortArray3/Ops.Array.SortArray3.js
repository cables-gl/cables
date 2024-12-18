let inArr = op.inArray("Array");
let what = op.inValueSelect("What", ["None", "X", "Y", "Z", "XYZ"]);
what.set("X");
let outArr = op.outArray("Result", 3);

let comparator = compareX;
let arrArr = [];

op.toWorkPortsNeedToBeLinked(inArr);

function compareX(a, b) { return a[0] - b[0]; }

function compareY(a, b) { return a[1] - b[1]; }

// function compareZ(a, b){ return b[2]-a[2]; }
function compareZ(a, b) { return a[2] - b[2]; }

function compareXYZ(a, b) { return (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]); }

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

inArr.onChange = recalc;

function recalc()
{
    if (!Array.isArray(inArr.get()))
    {
        outArr.set(null);
        return;
    }
    if (!comparator)
    {
        outArr.setRef(inArr.get());
        return;
    }

    let start = performance.now();

    sliceArray();

    arrArr.sort(comparator);

    if (arrArr.flat)arrArr = arrArr.flat();
    else arrArr = [].concat.apply([], arrArr);

    outArr.setRef(arrArr);
}

what.onChange = function ()
{
    // if(what.get()=='None')comparator=null;
    if (what.get() == "X")comparator = compareX;
    if (what.get() == "Y")comparator = compareY;
    if (what.get() == "Z")comparator = compareZ;
    if (what.get() == "XYZ")comparator = compareXYZ;
    recalc();
};
