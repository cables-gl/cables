const inNum = op.inFloat("Number", 0);
const outNum = op.outNumber("Result");

op.setUiAttrib({ "widthOnlyGrow": true });

inNum.onChange = update;

let title = "";
inNum.onLinkChanged = () =>
{
    if (inNum.isLinked()) title = inNum.links[0].getOtherPort(inNum).name;
    else title = "";
    update();
};

update();

function update()
{
    let n = inNum.get();
    // if (op.patch.isEditorMode())
    // {
    //     let str = "";
    //     if (n === null)str = "null";
    //     else if (isNaN(n))str = "NaN";
    //     else if (n === undefined)str = "undefined";
    //     else
    //     {
    //         str = "" + Math.round(n * 10000) / 10000;

    //         if (str[0] != "-")str = " " + str;
    //     }

    //     op.setUiAttribs({ "extendTitle": str });
    // }
    op.setUiAttribs({ "extendTitle": title + ": " + inNum.getValueForDisplay() });

    outNum.set(n);
}
