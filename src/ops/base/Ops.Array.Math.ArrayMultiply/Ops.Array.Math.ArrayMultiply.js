const
    inArray = op.inArray("In"),
    inValue = op.inValue("Value", 1.0),
    outArray = op.outArray("Result");

let newArr = [];
outArray.set(newArr);
inArray.onChange =
inValue.onChange = inArray.onChange = function ()
{
    let arr = inArray.get();
    if (!arr) return;

    let mul = inValue.get();

    if (newArr.length != arr.length)newArr.length = arr.length;

    for (let i = 0; i < arr.length; i++) newArr[i] = arr[i] * mul;

    outArray.setRef(newArr);
};

inArray.onLinkChanged = () =>
{
    if (inArray) inArray.copyLinkedUiAttrib("stride", outArray);
};
