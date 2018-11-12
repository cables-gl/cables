op.inTitle=op.inValueString("title",' ');
op.text=op.inValueText("text");

op.text.set(' ');
op.name=' ';

op.inTitle.set('new comment');

op.inTitle.onChange=update;
op.text.onChange=update;
op.onLoaded=update;


update();

function updateUI()
{
    if(CABLES.UI)
    {
        var uiOp=gui.patch().getUiOp(op);
        if(!uiOp)return;

        setTimeout(function()
        {
            op.name=op.inTitle.get();
            uiOp.oprect.updateComment();
        },30);

    }
}


function update()
{
    if(CABLES.UI)
    {

        op.uiAttr('title',op.inTitle.get());
        op.name=op.inTitle.get();

        updateUI();
    }
}


