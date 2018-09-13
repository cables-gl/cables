var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));
var interval=op.addInPort(new Port(op,"Interval",OP_PORT_TYPE_VALUE));
var delay=op.addInPort(new Port(op,"Delay",OP_PORT_TYPE_VALUE));
var percent=op.addOutPort(new Port(op,"percent"));

var anim=new CABLES.TL.Anim();
anim.setValue(1, 1);
anim.setValue(2, 2);
anim.setValue(3, 3);
anim.loop=true;
var lastLoop=-1;
anim.onLooped=function()
{
    // console.log('loop',CABLES.now()-lastLoop);
    // if(CABLES.now()-lastLoop>interval.get()*1000)
    // {
        trigger.trigger();
        setAnim();

    // }
    // lastLoop=CABLES.now();
    
};

delay.set(0);
delay.onValueChanged=setAnim;
interval.onChange=setAnim;
interval.set(1);

var startTime=CABLES.now();

function setAnim()
{
    anim.keys[0].time=0;
    anim.keys[0].value=0;
    anim.keys[1].time=delay.get();
    anim.keys[1].value=0;
    anim.keys[2].time=delay.get()+interval.get();
    anim.keys[2].value=1;
}

exe.onTriggered=function()
{
    var now=(CABLES.now()-startTime)/1000;
    var perc=anim.getValue(now);

    percent.set( perc );
    

};