op.name="Div";

var text=op.addInPort(new Port(op,"Text",OP_PORT_TYPE_VALUE,{type:'string'}));

var posLeft=op.addInPort(new Port(op,"Left",OP_PORT_TYPE_VALUE));
var posTop=op.addInPort(new Port(op,"Top",OP_PORT_TYPE_VALUE));

var borderRadius=op.addInPort(new Port(op,"Border radius",OP_PORT_TYPE_VALUE));
var fontSize=op.addInPort(new Port(op,"Font size",OP_PORT_TYPE_VALUE));

var cursor=op.addInPort(new Port(op,"cursor",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["auto","crosshair","pointer","Hand","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help"]} ));


var r=op.addInPort(new Port(op,"Text Red",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new Port(op,"Text Green",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"Text Blue",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"Text Opacity",OP_PORT_TYPE_VALUE,{ display:'range' }));

var bgR=op.addInPort(new Port(op,"Background Red",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var bgG=op.addInPort(new Port(op,"Background Green",OP_PORT_TYPE_VALUE,{ display:'range' }));
var bgB=op.addInPort(new Port(op,"Background Blue",OP_PORT_TYPE_VALUE,{ display:'range' }));
var bgA=op.addInPort(new Port(op,"Background Opacity",OP_PORT_TYPE_VALUE,{ display:'range' }));



r.set(1);
g.set(1);
b.set(1);
a.set(1);

bgR.set(0.5);
bgG.set(0.5);
bgB.set(0.5);
bgA.set(1);

var autoSize=op.addInPort(new Port(op,"Auto width/height",OP_PORT_TYPE_VALUE,{display:'bool'}));
var width=op.addInPort(new Port(op,"Width",OP_PORT_TYPE_VALUE));
var height=op.addInPort(new Port(op,"Height",OP_PORT_TYPE_VALUE));

var clickTrigger=op.addOutPort(new Port(op,"OnClick",OP_PORT_TYPE_FUNCTION));
var mouseOver=op.addOutPort(new Port(op,"MouseOver",OP_PORT_TYPE_VALUE,{type:'bool'}));
var clientWidth=op.addOutPort(new Port(op,"Client Width",OP_PORT_TYPE_VALUE));
var clientHeight=op.addOutPort(new Port(op,"Client Height",OP_PORT_TYPE_VALUE));


text.set('This is a HTML element');
width.set(100);
height.set(30);
fontSize.set(12);
autoSize.set(true);
autoSize.set(true);

mouseOver.set(false);
var element=null;
var textContent = document.createTextNode(text.get()); 

width.onValueChanged=updateSize;
height.onValueChanged=updateSize;
autoSize.onValueChanged=updateSize;
posLeft.onValueChanged=updatePos;
posTop.onValueChanged=updatePos;

bgR.onValueChanged=updateBgColor;
bgG.onValueChanged=updateBgColor;
bgB.onValueChanged=updateBgColor;
bgA.onValueChanged=updateBgColor;

r.onValueChanged=updateColor;
g.onValueChanged=updateColor;
b.onValueChanged=updateColor;
a.onValueChanged=updateColor;

fontSize.onValueChanged=updateFont;
borderRadius.onValueChanged=updateBorder;
cursor.onValueChanged=updateCursor;
init();

function updateClientSize()
{
    clientWidth.set(element.clientWidth);
    clientHeight.set(element.clientHeight);
}

function updateSize()
{
    if(!element) return;
    if(!autoSize.get())
    {
        element.style.width=width.get()+"px";
        element.style.height=height.get()+"px";
    }
    else
    {
        element.style.height="auto";
        element.style.width="auto";
    }
    updateClientSize();
}

function updateFont()
{
    if(!element) return;
    element.style['font-size']=fontSize.get()+"px";
    updateClientSize();
}

function updateBorder()
{
    if(!element) return;
    element.style['border-radius']=borderRadius.get()+"px";
}

function updateBgColor()
{
    if(!element) return;
    element.style["background-color"]='rgba('+Math.round(bgR.get()*255)+','+Math.round(bgG.get()*255)+','+Math.round(bgB.get()*255)+','+(bgA.get())+')';
}

function updateColor()
{
    if(!element) return;
    element.style.color='rgba('+Math.round(r.get()*255)+','+Math.round(g.get()*255)+','+Math.round(b.get()*255)+','+(a.get())+')';
}

function updatePos()
{
    if(!element) return;
    element.style['margin-left']=posLeft.get()+"px";
    element.style['margin-top']=posTop.get()+"px";
}

function updateCursor()
{
    if(!element) return;
    element.style.cursor=cursor.get();
}


text.onValueChanged=function()
{
    textContent.nodeValue=text.get();
    updateClientSize();
};



function init()
{
    element = document.createElement('div');
    element.style.padding="10px";
    element.style.position="absolute";
    element.style.overflow="hidden";
    element.style["z-index"]="99999";
    // element.style["background-color"]="#f00";
    element.appendChild(textContent);

    var canvas = document.getElementById("cablescanvas"); 
    canvas.appendChild(element);

    updateSize();
    updatePos();
    updateBgColor();
    updateColor();
    updateBorder();
    updateFont();
    updateClientSize();
    updateCursor();
    
    element.onclick=function()
    {
        clickTrigger.trigger();
    };

    element.onmouseover=function()
    {
        mouseOver.set(true);
    };

    element.onmouseleave=function()
    {
        mouseOver.set(false);
    };
}

op.onDelete=function()
{
    element.remove();
}