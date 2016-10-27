addListeners();
var self=this;
var cgl=self.patch.cgl;

this.name='mouse';
this.mouseX=this.addOutPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
this.mouseY=this.addOutPort(new Port(this,"y",OP_PORT_TYPE_VALUE));
this.mouseDown=this.addOutPort(new Port(this,"button down",OP_PORT_TYPE_VALUE));
this.mouseClick=this.addOutPort(new Port(this,"click",OP_PORT_TYPE_FUNCTION));
var mouseUp=this.addOutPort(new Port(this,"Button Up",OP_PORT_TYPE_FUNCTION));
this.mouseClickRight=this.addOutPort(new Port(this,"click right",OP_PORT_TYPE_FUNCTION));
this.mouseOver=this.addOutPort(new Port(this,"mouseOver",OP_PORT_TYPE_VALUE));
this.relative=this.addInPort(new Port(this,"relative",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.normalize=this.addInPort(new Port(this,"normalize",OP_PORT_TYPE_VALUE,{display:'bool'}));

this.smooth=this.addInPort(new Port(this,"smooth",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.smoothSpeed=this.addInPort(new Port(this,"smoothSpeed",OP_PORT_TYPE_VALUE));


var area=op.addInPort(new Port(op,"Area",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['Canvas','Document']}));

area.set("Canvas");
var outButton=this.addOutPort(new Port(this,"button",OP_PORT_TYPE_VALUE));




this.multiply=this.addInPort(new Port(this,"multiply",OP_PORT_TYPE_VALUE));
this.flipY=this.addInPort(new Port(this,"flip y",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.multiply.set(1.0);

this.smoothSpeed.set(20);
var speed=this.smoothSpeed.get();
var listenerElement=null;

var smoothTimer;

function setValue(x,y)
{
    if(self.normalize.get())
    {
        var w=cgl.canvas.width;
        var h=cgl.canvas.height;
        if(listenerElement==document.body)
        {
            w=listenerElement.clientWidth;
            h=listenerElement.clientHeight;
        }
        self.mouseX.set( (x/w*2.0-1.0)*self.multiply.get() );
        self.mouseY.set( (y/h*2.0-1.0)*self.multiply.get() );
    }
    else
    {
        self.mouseX.set( x*self.multiply.get() );
        self.mouseY.set( y*self.multiply.get() );
    }
}

this.smooth.onValueChanged=function()
{
    if(self.smooth.get()) smoothTimer = setInterval(updateSmooth, 15);
        else clearTimeout(smoothTimer);
};

var smoothX,smoothY;
var lineX=0,lineY=0;

var mouseX=cgl.canvas.width/2;
var mouseY=cgl.canvas.height/2;
lineX=mouseX;
lineY=mouseY;

this.mouseX.set(mouseX);
this.mouseY.set(mouseY);


var relLastX=0;
var relLastY=0;
var offsetX=0;
var offsetY=0;
addListeners();

area.onValueChanged=addListeners;

function updateSmooth()
{
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
    self.mouseDown.set(false);
    self.mouseOver.set(true);
    speed=self.smoothSpeed.get();
};

var onMouseDown = function(e)
{
    outButton.set(e.which);
    self.mouseDown.set(true);
};

var onMouseUp = function(e)
{
    
    outButton.set(0);
    self.mouseDown.set(false);
    self.mouseClick.set(false);
    mouseUp.trigger();
};

var onClickRight= function(e)
{
    self.mouseClickRight.trigger();
    e.preventDefault();
};

function onmouseclick(e)
{
    // console.log('click');
    self.mouseClick.trigger();
}


function onMouseLeave(e)
{
    relLastX=0;
    relLastY=0;

    speed=100;
    
    if(area.get()=='Canvas')
    {
        // leave anim
        if(self.smooth.get())
        {
            mouseX=cgl.canvas.width/2;
            mouseY=cgl.canvas.height/2;
        }
        
    }
    self.mouseOver.set(false);
    self.mouseDown.set(false);
}

this.relative.onValueChanged=function()
{
    offsetX=0;
    offsetY=0;
};

var onmousemove = function(e)
{
    self.mouseOver.set(true);
    
    // console.log(e);
    
    if(!self.relative.get())
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

        if(self.smooth.get())
        {
            mouseX=offsetX;
            
            if(self.flipY.get()) mouseY=listenerElement.clientHeight-offsetY;
                else mouseY=offsetY;
        }
        else
        {
            if(self.flipY.get()) setValue(offsetX,listenerElement.clientHeight-offsetY);
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

        mouseX+=offsetX;
        mouseY+=offsetY;
        
        if(mouseY>460)mouseY=460;

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


this.onDelete=function()
{
    console.log("remove mouse op...");
    removeLiseteners();
};


addListeners();ddListeners();
