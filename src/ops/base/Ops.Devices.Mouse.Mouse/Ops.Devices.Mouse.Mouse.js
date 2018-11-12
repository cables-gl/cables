
var outMouseX=op.addOutPort(new CABLES.Port(op,"x",CABLES.OP_PORT_TYPE_VALUE));
var outMouseY=op.addOutPort(new CABLES.Port(op,"y",CABLES.OP_PORT_TYPE_VALUE));
var mouseDown=op.addOutPort(new CABLES.Port(op,"button down",CABLES.OP_PORT_TYPE_VALUE));
var mouseClick=op.addOutPort(new CABLES.Port(op,"click",CABLES.OP_PORT_TYPE_FUNCTION));
var mouseUp=op.addOutPort(new CABLES.Port(op,"Button Up",CABLES.OP_PORT_TYPE_FUNCTION));
var mouseClickRight=op.addOutPort(new CABLES.Port(op,"click right",CABLES.OP_PORT_TYPE_FUNCTION));
var mouseOver=op.addOutPort(new CABLES.Port(op,"mouseOver",CABLES.OP_PORT_TYPE_VALUE));
var relative=op.addInPort(new CABLES.Port(op,"relative",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var normalize=op.addInPort(new CABLES.Port(op,"normalize",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var active=op.inValueBool("Active",true);
var smooth=op.addInPort(new CABLES.Port(op,"smooth",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var smoothSpeed=op.addInPort(new CABLES.Port(op,"smoothSpeed",CABLES.OP_PORT_TYPE_VALUE));
var area=op.addInPort(new CABLES.Port(op,"Area",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['Canvas','Document','Parent Element']}));
var outButton=op.addOutPort(new CABLES.Port(op,"button",CABLES.OP_PORT_TYPE_VALUE));
var multiply=op.addInPort(new CABLES.Port(op,"multiply",CABLES.OP_PORT_TYPE_VALUE));
var flipY=op.inValueBool("flip y",true);

area.set("Canvas");

multiply.set(1.0);
var smoothTimer=0;
smoothSpeed.set(20);

var cgl=op.patch.cgl;
var listenerElement=null;

function setValue(x,y)
{
    if(normalize.get())
    {
        var w=cgl.canvas.width;
        var h=cgl.canvas.height;
        if(listenerElement==document.body)
        {
            w=listenerElement.clientWidth;
            h=listenerElement.clientHeight;
        }
        outMouseX.set( (x/w*2.0-1.0)*multiply.get() );
        outMouseY.set( (y/h*2.0-1.0)*multiply.get() );
    }
    else
    {
        outMouseX.set( x*multiply.get() );
        outMouseY.set( y*multiply.get() );
    }
}

smooth.onChange=function()
{
    if(smooth.get()) smoothTimer = setInterval(updateSmooth, 5);
        else if(smoothTimer)clearTimeout(smoothTimer);
};

var smoothX,smoothY;
var lineX=0,lineY=0;

var mouseX=cgl.canvas.width/2;
var mouseY=cgl.canvas.height/2;
lineX=mouseX;
lineY=mouseY;

outMouseX.set(mouseX);
outMouseY.set(mouseY);

var relLastX=0;
var relLastY=0;
var offsetX=0;
var offsetY=0;
addListeners();

area.onChange=addListeners;

var speed=0;

function updateSmooth()
{
    speed=smoothSpeed.get();
    if(speed<=0)speed=0.01;
    var distanceX = Math.abs(mouseX - lineX);
    var speedX = Math.round( distanceX / speed, 0 );
    lineX = (lineX < mouseX) ? lineX + speedX : lineX - speedX;

    var distanceY = Math.abs(mouseY - lineY);
    var speedY = Math.round( distanceY / speed, 0 );
    lineY = (lineY < mouseY) ? lineY + speedY : lineY - speedY;

    setValue(lineX,lineY);
}

var onMouseEnter = function(e)
{
    mouseDown.set(false);
    mouseOver.set(true);
    speed=smoothSpeed.get();
};

var onMouseDown = function(e)
{
    outButton.set(e.which);
    mouseDown.set(true);
};

var onMouseUp = function(e)
{
    outButton.set(0);
    mouseDown.set(false);
    mouseUp.trigger();
};

var onClickRight= function(e)
{
    mouseClickRight.trigger();
    e.preventDefault();
};

function onmouseclick(e)
{
    mouseClick.trigger();
}


function onMouseLeave(e)
{
    relLastX=0;
    relLastY=0;

    speed=100;

    if(area.get()!='Document')
    {
        // leave anim
        if(smooth.get())
        {
            mouseX=cgl.canvas.width/2;
            mouseY=cgl.canvas.height/2;
        }

    }
    mouseOver.set(false);
    mouseDown.set(false);
}

relative.onChange=function()
{
    offsetX=0;
    offsetY=0;
}

function onmousemove(e)
{
    mouseOver.set(true);

    if(!relative.get())
    {
        if(area.get()!="Document")
        {
            offsetX=e.offsetX;
            offsetY=e.offsetY;
        }
        else
        {
            offsetX=e.clientX;
            offsetY=e.clientY;
        }

        if(smooth.get())
        {
            mouseX=offsetX;

            if(flipY.get()) mouseY=listenerElement.clientHeight-offsetY;
                else mouseY=offsetY;
        }
        else
        {
            if(flipY.get()) setValue(offsetX,listenerElement.clientHeight-offsetY);
                else setValue(offsetX,offsetY);
        }
    }
    else
    {
        if(relLastX!=0 && relLastY!=0)
        {
            offsetX=e.offsetX-relLastX;
            offsetY=e.offsetY-relLastY;
        }
        else
        {

        }

        relLastX=e.offsetX;
        relLastY=e.offsetY;

        mouseX+=offsetX;
        mouseY+=offsetY;

        if(mouseY>460)mouseY=460;
    }
};

function ontouchstart(event)
{
    mouseDown.set(true);

    if(event.touches && event.touches.length>0) onMouseDown(event.touches[0]);
};

function ontouchend(event)
{
    mouseDown.set(false);
    onMouseUp();
};

function removeListeners()
{
    listenerElement.removeEventListener('touchend', ontouchend);
    listenerElement.removeEventListener('touchstart', ontouchstart);

    listenerElement.removeEventListener('click', onmouseclick);
    listenerElement.removeEventListener('mousemove', onmousemove);
    listenerElement.removeEventListener('mouseleave', onMouseLeave);
    listenerElement.removeEventListener('mousedown', onMouseDown);
    listenerElement.removeEventListener('mouseup', onMouseUp);
    listenerElement.removeEventListener('mouseenter', onMouseEnter);
    listenerElement.removeEventListener('contextmenu', onClickRight);
    listenerElement=null;
}

function addListeners()
{
    if(listenerElement)removeListeners();

    listenerElement=cgl.canvas;
    if(area.get()=='Document') listenerElement=document.body;
    if(area.get()=='Parent Element') listenerElement=cgl.canvas.parentElement;

    listenerElement.addEventListener('touchend', ontouchend);
    listenerElement.addEventListener('touchstart', ontouchstart);

    listenerElement.addEventListener('click', onmouseclick);
    listenerElement.addEventListener('mousemove', onmousemove);
    listenerElement.addEventListener('mouseleave', onMouseLeave);
    listenerElement.addEventListener('mousedown', onMouseDown);
    listenerElement.addEventListener('mouseup', onMouseUp);
    listenerElement.addEventListener('mouseenter', onMouseEnter);
    listenerElement.addEventListener('contextmenu', onClickRight);
}

active.onChange=function()
{
    if(listenerElement)removeListeners();
    if(active.get())addListeners();
}

op.onDelete=function()
{
    removeListeners();
};

addListeners();
