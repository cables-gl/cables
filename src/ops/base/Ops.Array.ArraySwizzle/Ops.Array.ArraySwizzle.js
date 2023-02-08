const contents = ["X", "Y", "Z", "W", "0", "1"];
const
    inArr = op.inArray("Array"),
    inStride = op.inSwitch("Array Stride", ["1", "2", "3", "4"], "3"),
    inResultStride = op.inSwitch("Result Stride", ["1", "2", "3", "4"], "2"),
    in1 = op.inSwitch("X", contents, "X"),
    in2 = op.inSwitch("Y", contents, "Y"),
    in3 = op.inSwitch("Z", contents, "Z"),
    in4 = op.inSwitch("W", contents, "1"),
    outArr = op.outArray("Result");

op.setPortGroup("Content Result", [in1, in2, in3, in4]);

const result = [];

in1.onChange =
    in2.onChange =
    in3.onChange =
    in4.onChange =

    inStride.onChange =
    inResultStride.onChange = () =>
    {
        convert(true);
    };

inArr.onChange = convert;

function convert(updateUi)
{
    const arr = inArr.get();
    const srcStride = parseInt(inStride.get());
    const targetStride = parseInt(inResultStride.get());

    if (CABLES.UI && updateUi)
    {
        in1.setUiAttribs({ "greyout": targetStride < 1 });
        in2.setUiAttribs({ "greyout": targetStride < 2 });
        in3.setUiAttribs({ "greyout": targetStride < 3 });
        in4.setUiAttribs({ "greyout": targetStride < 4 });

        let str = "";
        if (srcStride == "1")str += "X";
        if (srcStride == "2")str += "XY";
        if (srcStride == "3")str += "XYZ";
        if (srcStride == "4")str += "XYZW";
        str += " > ";
        str += in1.get();
        if (targetStride >= 2)str += in2.get();
        if (targetStride >= 3)str += in3.get();
        if (targetStride >= 4)str += in4.get();
        op.setUiAttrib({ "extendTitle": str });
    }

    if (!arr) return outArr.set(null);
    const newLength = arr.length / srcStride * targetStride;

    if (newLength % 1 != 0)
    {
        outArr.set(null);
        op.setUiError("invalidlength", "Invalid array length, is not dividable by stride");
        return;
    }
    op.setUiError("invalidlength", null);

    if (
        (!CABLES.UTILS.isNumeric(in1.get()) && contents.indexOf(in1.get()) > srcStride - 1) ||
        (!CABLES.UTILS.isNumeric(in2.get()) && contents.indexOf(in2.get()) > srcStride - 1) ||
        (!CABLES.UTILS.isNumeric(in3.get()) && contents.indexOf(in3.get()) > srcStride - 1) ||
        (!CABLES.UTILS.isNumeric(in4.get()) && contents.indexOf(in4.get()) > srcStride - 1)
    )
    {
        outArr.set(null);
        op.setUiError("outofbounds", "out of bounds access");
        return;
    }
    op.setUiError("outofbounds", null);

    const step = parseInt(inStride.get());

    result.length = newLength;

    const index1 = contents.indexOf(in1.get());
    const index2 = contents.indexOf(in2.get());
    const index3 = contents.indexOf(in3.get());
    const index4 = contents.indexOf(in4.get());

    let idx = 0;

    for (let i = 0; i < arr.length; i += step)
    {
        outArr.setUiAttribs({ "stride": targetStride });

        if (targetStride >= 1)
        {
            if (index1 === 0)result[idx++] = arr[i + 0];
            else if (index1 === 1)result[idx++] = arr[i + 1];
            else if (index1 === 2)result[idx++] = arr[i + 2];
            else if (index1 === 3)result[idx++] = arr[i + 3];
            else if (index1 === 4)result[idx++] = 0;
            else if (index1 === 5)result[idx++] = 1;
        }

        if (targetStride >= 2)
        {
            if (index2 === 0)result[idx++] = arr[i + 0];
            else if (index2 === 1)result[idx++] = arr[i + 1];
            else if (index2 === 2)result[idx++] = arr[i + 2];
            else if (index2 === 3)result[idx++] = arr[i + 3];
            else if (index2 === 4)result[idx++] = 0;
            else if (index2 === 5)result[idx++] = 1;
        }

        if (targetStride >= 3)
        {
            if (index3 === 0)result[idx++] = arr[i + 0];
            else if (index3 === 1)result[idx++] = arr[i + 1];
            else if (index3 === 2)result[idx++] = arr[i + 2];
            else if (index3 === 3)result[idx++] = arr[i + 3];
            else if (index3 === 4)result[idx++] = 0;
            else if (index3 === 5)result[idx++] = 1;
        }

        if (targetStride >= 4)
        {
            if (index4 === 0)result[idx++] = arr[i + 0];
            else if (index4 === 1)result[idx++] = arr[i + 1];
            else if (index4 === 2)result[idx++] = arr[i + 2];
            else if (index4 === 3)result[idx++] = arr[i + 3];
            else if (index4 === 4)result[idx++] = 0;
            else if (index4 === 5)result[idx++] = 1;
        }
    }

    outArr.setRef(result);
}
