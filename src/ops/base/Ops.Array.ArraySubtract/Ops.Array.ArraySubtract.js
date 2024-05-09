const
    inArray = op.inArray("Array In"),
    inValue = op.inValue("Value", 1.0),
    inMode = op.inSwitch("Mode", ["Array-x", "x-Array"], "Array-x"),
    outArray = op.outArray("Array Out");

let newArr = [];
let mode = true;

inArray.onLinkChanged = () =>
{
    if (inArray) inArray.copyLinkedUiAttrib("stride", outArray);
};

inMode.onChange = () =>
{
    mode = inMode.get() === "Array-x";
    update();
};

outArray.set(newArr);

inArray.onChange =
    inValue.onChange = update;

function update()
{
    let arr = inArray.get();
    if (!arr) return;

    let subtract = inValue.get();

    if (newArr.length != arr.length)newArr.length = arr.length;

    let i = 0;

    if (mode)
        for (i = 0; i < arr.length; i++) newArr[i] = arr[i] - subtract;
    else
        for (i = 0; i < arr.length; i++) newArr[i] = subtract - arr[i];

    outArray.setRef(newArr);
}
