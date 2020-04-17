const
    inTitle=op.inString("title",'New comment'),
    inText=op.inTextarea("text")
    ;

op.init=
    inTitle.onChange=
    inText.onChange=
    op.onLoaded=update;

update();

function update()
{
    if(CABLES.UI)
    {
        op.uiAttr(
            {
                'comment_title':inTitle.get(),
                'comment_text':inText.get()
            });

        op.name=inTitle.get();
    }
}


