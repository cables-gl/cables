//Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='mouse';
this.mouseX=this.addOutPort(new CABLES.Port(this,"x",CABLES.OP_PORT_TYPE_VALUE));
this.mouseY=this.addOutPort(new CABLES.Port(this,"y",CABLES.OP_PORT_TYPE_VALUE));
this.mouseDown=this.addOutPort(new CABLES.Port(this,"button down",CABLES.OP_PORT_TYPE_VALUE));
this.mouseClick=this.addOutPort(new CABLES.Port(this,"click",CABLES.OP_PORT_TYPE_VALUE));
this.mouseOver=this.addOutPort(new CABLES.Port(this,"mouseOver",CABLES.OP_PORT_TYPE_VALUE));
this.normalize=this.addInPort(new CABLES.Port(this,"normalize",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));

this.smooth=this.addInPort(new CABLES.Port(this,"smooth",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
this.smoothSpeed=this.addInPort(new CABLES.Port(this,"smoothSpeed",CABLES.OP_PORT_TYPE_VALUE));

this.multiplyX=this.addInPort(new CABLES.Port(this,"multiply x",CABLES.OP_PORT_TYPE_VALUE));
this.multiplyX.set(1.0);

this.multiplyY=this.addInPort(new CABLES.Port(this,"multiply y",CABLES.OP_PORT_TYPE_VALUE));
this.multiplyY.set(1.0);


this.minY=this.addInPort(new CABLES.Port(this,"minY",CABLES.OP_PORT_TYPE_VALUE));
this.maxY=this.addInPort(new CABLES.Port(this,"maxY",CABLES.OP_PORT_TYPE_VALUE));
this.minY.set(-100);
this.maxY.set( 100);

this.minX=this.addInPort(new CABLES.Port(this,"minX",CABLES.OP_PORT_TYPE_VALUE));
this.maxX=this.addInPort(new CABLES.Port(this,"maxX",CABLES.OP_PORT_TYPE_VALUE));
this.minX.set(-100);
this.maxX.set( 100);


this.smoothSpeed.set(20);
var speed=this.smoothSpeed.get();

var smoothTimer;

function setValue(x,y)
{
    self.mouseX.set( x );
    self.mouseY.set( y );
}

this.smooth.onValueChanged=function()
{
    if(self.smooth.get()) smoothTimer = setInterval(updateSmooth, 15);
        else clearTimeout(smoothTimer);
};

var smoothX,smoothY;
var lineX=0,lineY=0;

var mouseX=0;
var mouseY=0;
lineX=mouseX;
lineY=mouseY;

this.mouseX.set(mouseX);
this.mouseY.set(mouseY);

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
    self.mouseOver.set(true);
    speed=self.smoothSpeed.get();
};

var onMouseDown = function(e)
{
    self.mouseDown.set(true);
};

var onMouseUp = function(e)
{
    self.mouseDown.set(false);
    self.mouseClick.set(false);
};

cgl.canvas.onmouseclick = function(e)
{
    self.mouseClick.set(true);
};

function onMouseLeave(e)
{
    relLastX=0;
    relLastY=0;

    // speed=100;
    // if(self.smooth.get())
    // {
        // mouseX=cgl.canvas.width/2;
        // mouseY=cgl.canvas.height/2;
    // }
    self.mouseOver.set(false);
}

var relLastX=0;
var relLastY=0;
var offsetX=0;
var offsetY=0;

var onmousemove = function(e)
{
    self.mouseOver.set(true);
    
    if(relLastX!==0 && relLastY!==0)
    {
        offsetX=e.offsetX-relLastX;
        offsetY=e.offsetY-relLastY;

        if(self.normalize.get())
        {
            offsetX*=(1/cgl.canvas.width);
            offsetY*=(1/cgl.canvas.height);
            
            console.log(offsetX,offsetY);
        }

        offsetX*=self.multiplyX.get();
        offsetY*=self.multiplyY.get();
    }

    if(mouseY<self.minY.get()) mouseY=self.minY.get();
    else if(mouseY>self.maxY.get()) mouseY=self.maxY.get();
    else if(mouseX<self.minX.get()) mouseX=self.minX.get();
    else if(mouseX>self.maxX.get()) 
    {
        mouseX=self.maxX.get();
        offsetX=0;
    // relLastY=0;
    }
    else
    {
        relLastX=e.offsetX;
        relLastY=e.offsetY;
        
    }

    mouseX+=offsetX;
    mouseY+=offsetY;
    
    
    // if(!self.smooth.get()) setValue(mouseX,mouseY);
};

cgl.canvas.addEventListener('mousemove', onmousemove);
cgl.canvas.addEventListener('mouseleave', onMouseLeave);
cgl.canvas.addEventListener('mousedown', onMouseDown);
cgl.canvas.addEventListener('mouseup', onMouseUp);
cgl.canvas.addEventListener('mouseenter', onMouseEnter);


