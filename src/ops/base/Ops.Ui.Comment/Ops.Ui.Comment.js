op.inTitle=op.inString("title",' ');
op.text=op.inTextarea("text");

op.text.set(' ');
op.name=' ';

op.inTitle.set('new comment');

op.inTitle.onChange=update;
op.text.onChange=update;
op.onLoaded=update;


update();

function update()
{
    if(CABLES.UI)
    {
        op.uiAttr(
            {
                'comment_title':op.inTitle.get(),
                'comment_text':op.text.get()
            });

        op.name=op.inTitle.get();

    }
}


