const
    inEle=op.inObject("Element"),
    active=op.inValueBool("active",true),
    filename=op.inUrl("image file"),
    inSize=op.inValueSelect("Size",["auto","length","cover","contain","initial","inherit","75%","50%","25%"],"cover"),
    inRepeat=op.inValueSelect("Repeat",["no-repeat","repeat","repeat-x","repeat-y"],"no-repeat"),
    inPosition=op.inValueSelect("Position",["left top","left center","left bottom","right top","right center","right bottom","center top","center center","center bottom"],"center center"),

    outEle=op.outObject("HTML Element");


op.onLoadedValueSet=
op.onLoaded=
inPosition.onChange=
inSize.onChange=
inEle.onChange=
inRepeat.onChange=
active.onChange=
filename.onChange=update;


var ele=null;

function update()
{
    op.setUiAttrib({"extendTitle":CABLES.basename(filename.get())});

    ele=inEle.get();
    if(ele && ele.style && filename.get())
    {
        if(!active.get())
        {
            ele.style['background-image']='none';
        }
        else
        {
            ele.style['background-image']='url('+filename.get()+')';
            ele.style['background-size']=inSize.get();
            ele.style['background-position']=inPosition.get();
            ele.style['background-repeat']=inRepeat.get();
        }
    }
    else
    {
        // really needed ?
        setTimeout(update,100);
    }

    outEle.set(inEle.get());
}

