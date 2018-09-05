// var text=op.addInPort(new Port(op,"Text",OP_PORT_TYPE_VALUE,{type:'string'}));
var text=op.addInPort(new Port(op,"Text",OP_PORT_TYPE_VALUE,{type:'string',display:'editor'}));

var id=op.addInPort(new Port(op,"Id",OP_PORT_TYPE_VALUE,{type:'string'}));
// var classes=op.addInPort(new Port(op,"Class",OP_PORT_TYPE_VALUE,{type:'string'}));
var classes=op.inValueString("Class");


var visible=op.addInPort(new Port(op,"Visible",OP_PORT_TYPE_VALUE,{display:"bool"}));
visible.set(true);


var doCenterX=op.inValueBool("Center X",false);
var doCenterY=op.inValueBool("Center Y",false);

var posLeft=op.addInPort(new Port(op,"Left",OP_PORT_TYPE_VALUE));
var posTop=op.addInPort(new Port(op,"Top",OP_PORT_TYPE_VALUE));

var borderRadius=op.addInPort(new Port(op,"Border radius",OP_PORT_TYPE_VALUE));
var fontSize=op.addInPort(new Port(op,"Font size",OP_PORT_TYPE_VALUE));
var fontFamily=op.addInPort(new Port(op,"Font Family",OP_PORT_TYPE_VALUE,{type:'string'}));

var cursor=op.addInPort(new Port(op,"cursor",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["auto","crosshair","pointer","Hand","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help"]} ));

var opacity=op.inValueSlider("Opacity",1.0);

var r=op.addInPort(new Port(op,"Text Red",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var g=op.addInPort(new Port(op,"Text Green",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"Text Blue",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"Text Opacity",OP_PORT_TYPE_VALUE,{ display:'range' }));

var bgR=op.addInPort(new Port(op,"Background Red",OP_PORT_TYPE_VALUE,{ display:'range', colorPick:'true' }));
var bgG=op.addInPort(new Port(op,"Background Green",OP_PORT_TYPE_VALUE,{ display:'range' }));
var bgB=op.addInPort(new Port(op,"Background Blue",OP_PORT_TYPE_VALUE,{ display:'range' }));
var bgA=op.addInPort(new Port(op,"Background Opacity",OP_PORT_TYPE_VALUE,{ display:'range' }));

var outElement=op.outObject("Element");

r.set(1);
g.set(1);
b.set(1);
a.set(1);

bgR.set(0.5);
bgG.set(0.5);
bgB.set(0.5);
bgA.set(1);

var ignoreMouse=op.addInPort(new Port(op,"Ignore Mouse",OP_PORT_TYPE_VALUE,{display:'bool'}));
ignoreMouse.set(false);

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
fontFamily.set("Arial");
autoSize.set(true);
autoSize.set(true);

mouseOver.set(false);
var element=null;


text.onValueChanged=updateText;

classes.onChange=updateClasses;
updateText();


width.onValueChanged=updateSize;
height.onValueChanged=updateSize;
autoSize.onValueChanged=updateSize;
posLeft.onValueChanged=updatePos;
posTop.onValueChanged=updatePos;
doCenterX.onValueChanged=updatePos;
doCenterY.onValueChanged=updatePos;

bgR.onValueChanged=updateBgColor;
bgG.onValueChanged=updateBgColor;
bgB.onValueChanged=updateBgColor;
bgA.onValueChanged=updateBgColor;

r.onValueChanged=updateColor;
g.onValueChanged=updateColor;
b.onValueChanged=updateColor;
a.onValueChanged=updateColor;

opacity.onChange=updateOpacity;

fontSize.onValueChanged=updateFont;
fontFamily.onValueChanged=updateFont;
borderRadius.onValueChanged=updateBorder;
cursor.onValueChanged=updateCursor;
ignoreMouse.onValueChanged=updateIgnoreMouse;
init();

visible.onValueChanged=function()
{
    if(visible.get()) element.style.display="block";
    else element.style.display="none";
};


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
    element.style['font-family']=fontFamily.get();
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

function updateOpacity()
{
    if(!element) return;
    element.style.opacity=opacity.get();
}

function updateColor()
{
    if(!element) return;
    element.style.color='rgba('+Math.round(r.get()*255)+','+Math.round(g.get()*255)+','+Math.round(b.get()*255)+','+(a.get())+')';
}

function updatePos()
{
    if(!element) return;
    var l=posLeft.get();
    var t=posTop.get();
    if(doCenterX.get()) l-=element.clientWidth/2;
    if(doCenterY.get()) t-=element.clientHeight/2;

    element.style['margin-left']=l+"px";
    element.style['margin-top']=t+"px";
    updateClientSize();
}

function updateCursor()
{
    if(!element) return;
    element.style.cursor=cursor.get();
}

function updateIgnoreMouse()
{
    if(ignoreMouse.get()) element.style['pointer-events']="none";
        else element.style['pointer-events']="default";
};

function updateText()
{
    if(!element)return;
    var str=String(text.get()||'').replace(/(?:\r\n|\r|\n)/g, '<br />');


    element.innerHTML=str;
    updateClientSize();
};

id.onValueChanged=function()
{
    element.id=id.get();
};

function updateClasses()
{
    if(element)
    {
        element.className = classes.get();
    }
    
}



function init()
{
    element = document.createElement('div');
    outElement.set(element);
    element.style.padding="10px";
    element.style.position="absolute";
    element.style.overflow="hidden";
    element.style["z-index"]="9999";
    
    // element.style["background-color"]="#f00";
    

    // var canvas = document.getElementById("cablescanvas") || document.body; 
    var canvas = op.patch.cgl.canvas.parentElement;
    canvas.appendChild(element);

    updateSize();
    updatePos();
    updateBgColor();
    updateColor();
    updateBorder();
    updateFont();
    updateClientSize();
    updateCursor();
    updateIgnoreMouse();
    updateOpacity();
    
    element.onclick=function(e)
    {
        clickTrigger.trigger();
        e.preventDefault();
    };

    element.ontouchstart=function(e)
    {
        clickTrigger.trigger();
        e.preventDefault();
    };

    element.onmouseover=function()
    {
        mouseOver.set(true);
    };

    element.onmouseleave=function()
    {
        mouseOver.set(false);
    };
    
    updateText();
    updateClasses();
}

op.onDelete=function()
{
    element.remove();
}