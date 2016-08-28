Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

var value=0;

this.name='mousewheel';

// this.mul=this.addInPort(new Port(this,"multiply",OP_PORT_TYPE_VALUE));
this.min=this.addInPort(new Port(this,"min",OP_PORT_TYPE_VALUE));
this.max=this.addInPort(new Port(this,"max",OP_PORT_TYPE_VALUE));
this.absVal=this.addOutPort(new Port(this,"absolute value",OP_PORT_TYPE_VALUE,{type:'float'}));


this.smooth=this.addInPort(new Port(this,"smooth",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.smoothSpeed=this.addInPort(new Port(this,"delay",OP_PORT_TYPE_VALUE));

this.preventScroll=this.addInPort(new Port(this,"prevent scroll",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.delta=this.addOutPort(new Port(this,"delta",OP_PORT_TYPE_VALUE));


this.min.set(-100);
this.max.set(100);
// this.mul.set(1.0);
this.smoothSpeed.set(0.3);

var anim=new CABLES.TL.Anim();
anim.defaultEasing=CABLES.TL.EASING_SIN_OUT;

var startTime=Date.now()/1000.0;

function updateSmooth()
{
    var v=anim.getValue( Date.now()/1000.0-startTime );
    //console.log(v);
    self.absVal.set( v );
}

this.smooth.onValueChanged=function()
{
    if(self.smooth.get()) smoothTimer = setInterval(updateSmooth, 15);
        else clearTimeout(smoothTimer);
};

var wheelDistance = function(evt){
  if (!evt) evt = event;
  var w=evt.wheelDelta, d=evt.detail;
  if (d){
    if (w) return w/d/40*d>0?1:-1; // Opera
    else return -d/3;              // Firefox;         TODO: do not /3 for OS X
  } else return w/120;             // IE/Safari/Chrome TODO: /3 for Chrome OS X
};

var v=0.35;
this.absVal.set(0.35);
anim.clear();
anim.setValue(Date.now()/1000.0-startTime,self.absVal.get());

var onMouseWheel=function(e)
{
    var delta=parseFloat( wheelDistance(e))*-0.05;

    self.delta.set(delta);
    v-=parseFloat(delta);

// console.log('v',v);
    
    if(v<self.min.get())v=parseFloat(self.min.get());
    if(v>self.max.get())v=parseFloat(self.max.get());
    
    if( !self.smooth.get() )
    {
        self.absVal.set(v);
    }
    else
    {
        anim.clear();
        anim.setValue(Date.now()/1000.0-startTime,self.absVal.get());
        anim.setValue(Date.now()/1000.0-startTime+self.smoothSpeed.get(),v);
    }
    
    if(self.preventScroll.get())
    {
        e.preventDefault();
    }
    

};

cgl.canvas.addEventListener('wheel', onMouseWheel);
