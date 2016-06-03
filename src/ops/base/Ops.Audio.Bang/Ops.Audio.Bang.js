this.name="Ops.Audio.Bang";

var self=this;
Op.apply(this, arguments);

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var beat=this.addInPort(new Port(this,"beat",OP_PORT_TYPE_FUNCTION));
var bang=this.addOutPort(new Port(this,"bang"));

var startValue=this.addInPort(new Port(this,"startValue"));
var endValue=this.addInPort(new Port(this,"endValue"));
var duration = 0;
var bpm=this.addInPort(new Port(this,"bpm"));

var anim=new CABLES.TL.Anim();

var easing=this.addInPort(new Port(this,"easing",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["linear","smoothstep","smootherstep"]} ));
easing.set('linear');

var lastBeat = 0;
var lastBeatTimeout = 3000;

function init()
{
    if(easing.get()=='linear') anim.defaultEasing=CABLES.TL.EASING_LINEAR;
    if(easing.get()=='smoothstep') anim.defaultEasing=CABLES.TL.EASING_SMOOTHSTEP;
    if(easing.get()=='smootherstep') anim.defaultEasing=CABLES.TL.EASING_SMOOTHERSTEP;

    anim.clear();

    if(bpm === 0){
        anim.setValue(parseFloat(1000 + Date.now()/1000.0), endValue.get());
    }else {
        duration = 4 / (bpm.get()/60); // duration of one beat in seconds
        anim.setValue(Date.now()/1000.0, startValue.get());
        anim.setValue(parseFloat(duration + Date.now()/1000.0), endValue.get());
    }
}

beat.onTriggered = function(){
    lastBeat = Date.now();
    var t=Date.now()/1000;
    var v=anim.getValue(t);
    init();
};

var redoAnimtion = true;

exe.onTriggered=function()
{
    // if there is no beat, don't bang
    if(bpm.get() === 0) {
        bang.set(endValue.get());
    }

    var t=Date.now()/1000;
    var v=anim.getValue(t);

    bang.set(v);
};

startValue.set(1.0);
endValue.set(0.0);
bpm.set(0);
init();

startValue.onValueChange(init);
endValue.onValueChange(init);
bpm.onValueChange(init);
easing.onValueChange(init);
