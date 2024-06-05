const
    outX = op.outNumber("X"),
    outY = op.outNumber("Y");

op.on("onUiAttribsChange", (attribs) =>
{
    if (attribs.translate && op.uiAttribs.translate)
    {
        outX.set(op.uiAttribs.translate.x);
        outY.set(op.uiAttribs.translate.y);

        const str = "" + Math.round(op.uiAttribs.translate.x) + "," + Math.round(op.uiAttribs.translate.y);

        op.setUiAttribs({ "extendTitle": str });
    }
});
