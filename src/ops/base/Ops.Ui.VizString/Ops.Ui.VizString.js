const inNum = op.inString("String", "");
const outNum = op.outString("Result");

op.setUiAttrib({ "widthOnlyGrow": true });

inNum.onChange = () =>
{
    const str = inNum.get();
    if (op.patch.isEditorMode())
    {
        op.setTitle(str);
    }

    outNum.set(inNum.get());
};
