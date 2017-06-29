op.name='Comment';
op.inTitle=op.inValueString("title");
op.text=op.inValueText("text");

op.inTitle.set('comment');
op.text.set('');

function update()
{
    if(CABLES.UI)
    {
        var uiOp=gui.patch().getUiOp(op);
        // console.log(uiOp);
        op.name=op.inTitle.get();
        op.uiAttr('title',op.inTitle.get());
        uiOp.oprect.updateComment();
    }
}

op.inTitle.onChange=update;
op.text.onChange=update;

