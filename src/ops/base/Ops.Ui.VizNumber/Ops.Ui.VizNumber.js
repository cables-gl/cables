const inNum = op.inFloat("Number", 0);
const outNum = op.outNumber("Result");

op.setUiAttrib({ "widthOnlyGrow": true });

inNum.onChange = () =>
{
    const n = inNum.get();
    if (op.patch.isEditorMode())
    {
        let str = Math.round(inNum.get() * 10000) / 10000;
        if (str[0] != "-")str = " " + str;
        op.setTitle(str);
    }

    outNum.set(inNum.get());
};
