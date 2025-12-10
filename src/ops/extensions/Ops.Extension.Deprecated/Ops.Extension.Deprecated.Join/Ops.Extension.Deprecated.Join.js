let inArr = op.inArray("Array");
let inSeperator = op.inValueString("Seperator", ",");
let inNewLine = op.inValueBool("New Line");
let outStr = op.outValue("Result");

inArr.onChange = exec;
outStr.onChange = exec;
inSeperator.onChange = exec;
inNewLine.onChange = exec;

function exec()
{
    let arr = inArr.get();
    let result = "";

    let sep = inSeperator.get();
    if (inNewLine.get())sep += "\n";

    if (arr && arr.join)
    {
        result = arr.join(sep);
    }

    outStr.set(result);
}
