const
    inArray = op.inArray("Array In"),
    inValue = op.inValue("Value", 1.0),
    inMode = op.inSwitch("Mode", ["Array/x", "x/Array"], "Array/x"),
    outArray = op.outArray("Array Out");

const newArr = [];
let mode = true;
outArray.set(newArr);

inArray.onLinkChanged = () =>
{
    if (inArray) inArray.copyLinkedUiAttrib("stride", outArray);
};

inMode.onChange = () =>
{
    mode = inMode.get() === "Array/x";
    update();
};

inArray.onChange = inValue.onChange = inArray.onChange = update;

function update()
{
    let arr = inArray.get();
    if (!arr) return;

    let divide = inValue.get();

    if (newArr.length != arr.length) newArr.length = arr.length;

    if (mode)
        for (let i = 0; i < arr.length; i++) newArr[i] = arr[i] / divide;
    else
        for (let i = 0; i < arr.length; i++) newArr[i] = divide / arr[i];

    outArray.setRef(newArr);
}
