
var exe=op.addInPort(new CABLES.Port(op,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var state = op.addInPort(new CABLES.Port(op,"state",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var v=op.addInPort(new CABLES.Port(op,"anim value",CABLES.OP_PORT_TYPE_VALUE));

var result=op.addOutPort(new CABLES.Port(op,"result"));
var outTime=op.addOutPort(new CABLES.Port(op,"time",CABLES.OP_PORT_TYPE_VALUE));
var outPerc=op.addOutPort(new CABLES.Port(op,"Percentage",CABLES.OP_PORT_TYPE_VALUE));

var animTime=new CABLES.Anim();

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
state.onChange=toggle;
