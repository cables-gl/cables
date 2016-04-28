op.name="Div";

var text=op.addInPort(new Port(op,"Text",OP_PORT_TYPE_VALUE,{type:'string'}));

var posLeft=op.addInPort(new Port(op,"Left",OP_PORT_TYPE_VALUE));
var posTop=op.addInPort(new Port(op,"Top",OP_PORT_TYPE_VALUE));

var borderRadius=op.addInPort(new Port(op,"Border Radius",OP_PORT_TYPE_VALUE));


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

var width=op.addInPort(new Port(op,"Width",OP_PORT_TYPE_VALUE));
var height=op.addInPort(new Port(op,"Height",OP_PORT_TYPE_VALUE));

var clickTrigger=op.addOutPort(new Port(op,"OnClick",OP_PORT_TYPE_FUNCTION));
var mouseOver=op.addOutPort(new Port(op,"MouseOver",OP_PORT_TYPE_VALUE,{type:'bool'}));

text.set('This is a DIV element');
width.set(100);
height.set(30);

mouseOver.set(false);
var element=null;
var textContent = document.createTextNode(text.get()); 

width.onValueChanged=updateSize;
height.onValueChanged=updateSize;
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


borderRadius.onValueChanged=updateBorder;

init();


function updateSize()
{
    if(!element) return;
    element.style.width=width.get()+"px";
    element.style.height=height.get()+"px";
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

text.onValueChanged=function()
{
    textContent.nodeValue=text.get();
};

function init()
{
    element = document.createElement('div');
    element.style.padding="10px";
    element.style.position="absolute";
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