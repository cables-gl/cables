const
    inArray = op.inArray("Array In"),
    inValue = op.inValue("Value", 2.0),
    outArray = op.outArray("Array Out");

let newArr = [];
outArray.set(newArr);
inArray.onChange =
inValue.onChange = inArray.onChange = function ()
{
    let arr = inArray.get();
    if (!arr) return;

    let modulo = inValue.get();

    if (newArr.length != arr.length) newArr.length = arr.length;

    let i = 0;
    for (i = 0; i < arr.length; i++)
    {
        newArr[i] = arr[i] % modulo;
    }
    outArray.setRef(newArr);
};

inArray.onLinkChanged = () =>
{
    if (inArray) inArray.copyLinkedUiAttrib("stride", outArray);
};
