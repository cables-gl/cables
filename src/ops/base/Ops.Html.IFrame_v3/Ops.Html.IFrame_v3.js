const
    src=op.inString("URL",'https://undev.studio'),
    elId=op.inString("ID"),
    active=op.inBool("Active",true),
    inStyle=op.inStringEditor("Style","position:absolute;\nz-index:9999;\nborder:0;\nwidth:50%;\nheight:50%;"),
    outEle=op.outObject("Element");

op.setPortGroup('Attributes',[src,elId]);

let element=null;

inStyle.onChange=updateStyle;
src.onChange=updateURL;
elId.onChange=updateID;
op.onDelete=removeEle;
active.onChange=updateActive;

addElement();
updateStyle();
updateURL();

outEle.set(element);

function addElement()
{
    element = document.createElement('iframe');
    const parent = op.patch.cgl.canvas.parentElement;
    parent.appendChild(element);
}

function updateStyle()
{
    element.setAttribute("style",inStyle.get());
}

function updateURL()
{
    element.setAttribute('src',src.get());
}

function updateID()
{
    element.setAttribute('id',elId.get());
}

function removeEle()
{
    if(element && element.parentNode)element.parentNode.removeChild(element);
}

function updateActive()
{
    if(!active.get())
    {
        removeEle();
        return;
    }

    addElement();
}
