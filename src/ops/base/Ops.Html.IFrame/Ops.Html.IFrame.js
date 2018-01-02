
var width=op.inValue("width",400);
var height=op.inValue("height",400);
var src=op.inValueString("URL",'https://undev.studio');
var elId=op.inValueString("ID");

function updateSize()
{
    element.style.width=width.get()+"px";
    element.style.height=width.get()+"px";
}

function updateURL()
{
    element.setAttribute('src',src.get());
}

function updateID()
{
    element.setAttribute('id',elId.get());
}


var element = document.createElement('iframe');
element.style.position="absolute";
element.style.width="40px";
element.style.height="40px";
element.style["z-index"]="9999";

var canvas = op.patch.cgl.canvas.parentElement;
canvas.appendChild(element);


width.onChange=updateSize;
src.onChange=updateURL;
elId.onChange=updateID;
updateSize();
updateURL();


op.onDelete=function()
{
    element.remove();
};