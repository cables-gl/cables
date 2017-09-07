op.name="Bool TimeLine Scrub";

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var state = op.addInPort(new Port(op,"state",OP_PORT_TYPE_VALUE,{display:'bool'}));
var v=op.addInPort(new Port(op,"anim value",OP_PORT_TYPE_VALUE));

var result=op.addOutPort(new Port(op,"result"));
var outTime=op.addOutPort(new Port(op,"time",OP_PORT_TYPE_VALUE));
var outPerc=op.addOutPort(new Port(op,"Percentage",OP_PORT_TYPE_VALUE));

var animTime=new CABLES.TL.Anim();

var lastState=true;
var firstState=true;

var toggle=function()
{
    if( ( state.get()!=lastState && v.anim ))
    {

        var l=v.anim.getLength();
        var t=Date.now()/1000;
        lastState=state.get();
        var valueNow=animTime.getValue(t);
        animTime.clear();

        animTime.setValue(t,valueNow);

        if(state.get()) animTime.setValue(t+l,l);
            else animTime.setValue(t+l,0);
    }
};

var exec=function()
{
    var va=0;

    if(CABLES.UI)
    {
        if(!v.isAnimated())
        {
            op.uiAttr({'error':'anim value should be animated'});
            return;
        }
        else
        {
            op.uiAttr({'error':null});
        }
    }

    var t=Date.now()/1000;
    va=v.anim.getValue(animTime.getValue(t));

    if(animTime.keys.length>=1)
    {
        var perc=(t-animTime.keys[0].time)/(animTime.keys[1].time-animTime.keys[0].time);
        if(perc>1)perc=1;
        if(!state.get())perc=1-perc;
        outPerc.set( perc );
    }


    if(result.get()!=va) result.set(va);

};

exe.onTriggered=exec;
state.onValueChanged=toggle;
