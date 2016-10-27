

op.name='mouse';
var mouseX=op.addOutPort(new Port(op,"x",OP_PORT_TYPE_VALUE));
var mouseY=op.addOutPort(new Port(op,"y",OP_PORT_TYPE_VALUE));
var mouseDown=op.addOutPort(new Port(op,"button down",OP_PORT_TYPE_VALUE));
var mouseClick=op.addOutPort(new Port(op,"click",OP_PORT_TYPE_FUNCTION));
var mouseClickRight=op.addOutPort(new Port(op,"click right",OP_PORT_TYPE_FUNCTION));
var mouseOver=op.addOutPort(new Port(op,"mouseOver",OP_PORT_TYPE_VALUE));
var relative=op.addInPort(new Port(op,"relative",OP_PORT_TYPE_VALUE,{display:'bool'}));
var normalize=op.addInPort(new Port(op,"normalize",OP_PORT_TYPE_VALUE,{display:'bool'}));

var smooth=op.addInPort(new Port(op,"smooth",OP_PORT_TYPE_VALUE,{display:'bool'}));
var smoothSpeed=op.addInPort(new Port(op,"smoothSpeed",OP_PORT_TYPE_VALUE));


var cgl=op.patch.cgl;
var area=op.addInPort(new Port(op,"Area",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['Canvas','Document']}));

area.set("Canvas");
var outButton=op.addOutPort(new Port(op,"button",OP_PORT_TYPE_VALUE));




var multiply=op.addInPort(new Port(op,"multiply",OP_PORT_TYPE_VALUE));
var flipY=op.addInPort(new Port(op,"flip y",OP_PORT_TYPE_VALUE,{display:'bool'}));
multiply.set(1.0);

smoothSpeed.set(20);
var speed=smoothSpeed.get();
var listenerElement=null;

var smoothTimer;

var clientHeight=0;

function setValue(x,y)
{
    if(normalize.get())
    {
        var w=cgl.canvas.width;
        var h=cgl.canvas.height;
        if(listenerElement==document.body)
        {
            w=window.innerWidth;
            clientHeight=h=window.innerHeight;
            // console.log('w,h',w,h);
        }
        else
        {
            clientHeight=h;
        }
        mouseX.set( (x/w*2.0-1.0)*multiply.get() );
        mouseY.set( (y/h*2.0-1.0)*multiply.get() );
    }
    else
    {
        mouseX.set( x*multiply.get() );
        mouseY.set( y*multiply.get() );
    }
}

smooth.onValueChanged=function()
{
    if(smooth.get()) smoothTimer = setInterval(updateSmooth, 15);
        else clearTimeout(smoothTimer);
};

var smoothX,smoothY;


var mX=cgl.canvas.width/2 || 100;
var mY=cgl.canvas.height/2 || 100;
var lineX=mX;
var lineY=mY;

mouseX.set(mX);
mouseY.set(mY);


var relLastX=0;
var relLastY=0;
var offsetX=0;
var offsetY=0;
addListeners();

area.onValueChanged=addListeners;

function updateSmooth()
{
    if(speed<=0)speed=0.01;
    var distanceX = Math.abs(mX - lineX);
    var speedX = Math.round( distanceX / speed, 0 );
    lineX = (lineX < mX) ? lineX + speedX : lineX - speedX;

    var distanceY = Math.abs(mY - lineY);
    var speedY = Math.round( distanceY / speed, 0 );
    lineY = (lineY < mY) ? lineY + speedY : lineY - speedY;

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
    mouseClick.set(false);
};

var onClickRight= function(e)
{
    mouseClickRight.trigger();
    e.preventDefault();
};

function onmouseclick(e)
{
    // console.log('click');
    mouseClick.trigger();
}


function onMouseLeave(e)
{
    relLastX=0;
    relLastY=0;

    speed=100;
    
    if(area.get()=='Canvas')
    {
        // leave anim
        if(smooth.get())
        {
            mX=cgl.canvas.width/2;
            mY=cgl.canvas.height/2;
        }
        
    }
    mouseOver.set(false);
    mouseDown.set(false);
}

relative.onValueChanged=function()
{
    offsetX=0;
    offsetY=0;
};

var onmousemove = function(e)
{
    mouseOver.set(true);
    
    // console.log(e);
    
    if(!relative.get())
    {
        if(area.get()=="Canvas")
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
            mX=offsetX;
            
            if(flipY.get()) mY=clientHeight-offsetY;
                else mY=offsetY;
        }
        else
        {
            if(flipY.get()) setValue(offsetX,clientHeight-offsetY);
                else setValue(offsetX,offsetY);
        }

    }
    else
    {
        if(relLastX!=0 && relLastY!=0)
        {
            // console.log('diff',offsetX);
            offsetX=e.offsetX-relLastX;
            offsetY=e.offsetY-relLastY;
        }
        else
        {
            // console.log('reset');
        }

        relLastX=e.offsetX;
        relLastY=e.offsetY;

        mX+=offsetX;
        mY+=offsetY;
        
        if(mY>460)mY=460;

        // console.log(mouseX,mouseY);
    }
    
};


function removeLiseteners()
{
    
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
    if(listenerElement)removeLiseteners();
    
    listenerElement=cgl.canvas;
    if(area.get()=='Document') listenerElement=document.body;
    
    listenerElement.addEventListener('click', onmouseclick);
    listenerElement.addEventListener('mousemove', onmousemove);
    listenerElement.addEventListener('mouseleave', onMouseLeave);
    listenerElement.addEventListener('mousedown', onMouseDown);
    listenerElement.addEventListener('mouseup', onMouseUp);
    listenerElement.addEventListener('mouseenter', onMouseEnter);
    listenerElement.addEventListener('contextmenu', onClickRight);
}


op.onDelete=function()
{
    console.log("remove mouse op...");
    removeLiseteners();
};


addListeners();