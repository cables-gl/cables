op.name="IntervalAnim";

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));
var interval=op.addInPort(new Port(op,"Interval",OP_PORT_TYPE_VALUE));
var delay=op.addInPort(new Port(op,"Delay",OP_PORT_TYPE_VALUE));
var percent=op.addOutPort(new Port(op,"percent"));

var anim=new CABLES.TL.Anim();
anim.setValue(1, 1);
anim.setValue(2, 2);
anim.loop=true;

delay.set(0);
delay.onValueChanged=setAnim;
interval.onValueChanged=setAnim;
interval.set(1);

window.performance = (window.performance || {
    offset: Date.now(),
    now: function now(){ return Date.now() - this.offset; }
});

function setAnim()
{
    anim.keys[0].time=delay.get();
    anim.keys[0].value=0;
    anim.keys[1].time=delay.get()+interval.get();
    anim.keys[1].value=1;
}


exe.onTriggered=function()
{
    percent.set( anim.getValue( performance.now()/1000 ) );
    
    anim.onLooped=function()
    {
        trigger.trigger();
    };

};