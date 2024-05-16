const inStr = op.inString("String", "");
const outNum = op.outString("Result");

op.setUiAttrib({ "widthOnlyGrow": true });
op.checkMainloopExists();

inStr.onChange = () =>
{
    let str = inStr.get();
    if (op.patch.isEditorMode())
    {
        if (str === null)str = "null";
        else if (str === undefined)str = "undefined";
        else str = "\"" + (String(str) || "") + "\"";
        op.setTitle(str);
    }

    outNum.set(inStr.get());
};
