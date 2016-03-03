var self=this;
Op.apply(this, arguments);

this.name='random anim';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var result=this.addOutPort(new Port(this,"result"));

var min=this.addInPort(new Port(this,"min"));
var max=this.addInPort(new Port(this,"max"));
var duration=this.addInPort(new Port(this,"duration"));

var anim=new CABLES.TL.Anim();

var easing=this.addInPort(new Port(this,"easing",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["linear","smoothstep","smootherstep"]} ));
easing.set('linear');


function getRandom()
{
    var minVal = parseFloat( min.get() );
    var maxVal = parseFloat( max.get() );
    return Math.seededRandom() * ( maxVal - minVal ) + minVal;
}

function init(v)
{
    if(easing.get()=='linear') anim.defaultEasing=CABLES.TL.EASING_LINEAR;
    if(easing.get()=='smoothstep') anim.defaultEasing=CABLES.TL.EASING_SMOOTHSTEP;
    if(easing.get()=='smootherstep') anim.defaultEasing=CABLES.TL.EASING_SMOOTHERSTEP;
    
    
    anim.clear();
    if(v===undefined) v=getRandom();
    anim.setValue(Date.now()/1000.0, v);
    anim.setValue(parseFloat(duration.get())+Date.now()/1000.0, getRandom());
}

exe.onTriggered=function()
{
    var t=Date.now()/1000;
    var v=anim.getValue(t);
    if(anim.hasEnded(t))
    {
        anim.clear();
        init(v);
    }
    result.set(v);
};

min.set(0.0);
max.set(1.0);
duration.set(0.5);
init();

min.onValueChange(init);
max.onValueChange(init);
duration.onValueChange(init);
easing.onValueChange(init);
