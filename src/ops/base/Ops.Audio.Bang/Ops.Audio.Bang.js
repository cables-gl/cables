this.name="Ops.Audio.Bang";

var exe=this.addInPort(new CABLES.Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var beat=op.inTriggerButton("beat");
var bang=this.addOutPort(new CABLES.Port(this,"bang"));

var startValue=this.addInPort(new CABLES.Port(this,"startValue"));
var endValue=this.addInPort(new CABLES.Port(this,"endValue"));
var duration = 0;
var bpm=this.addInPort(new CABLES.Port(this,"bpm"));

var anim=new CABLES.Anim();

var easing=this.addInPort(new CABLES.Port(this,"easing",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:["linear","smoothstep","smootherstep"]} ));
easing.set('linear');


function init()
{
    if(easing.get()=='linear') anim.defaultEasing=CABLES.TL.EASING_LINEAR;
    if(easing.get()=='smoothstep') anim.defaultEasing=CABLES.TL.EASING_SMOOTHSTEP;
    if(easing.get()=='smootherstep') anim.defaultEasing=CABLES.TL.EASING_SMOOTHERSTEP;

    anim.clear();

    if(bpm === 0){
        anim.setValue(parseFloat(1000 + op.patch.freeTimer.get()), endValue.get());
    }else {
        duration = 4 / (bpm.get()/60); // duration of one beat in seconds
        anim.setValue(op.patch.freeTimer.get(), startValue.get());
        anim.setValue(parseFloat(duration + op.patch.freeTimer.get()), endValue.get());
    }
}

beat.onTriggered = function(){
    var t=op.patch.freeTimer.get();
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

    var t=op.patch.freeTimer.get();
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
