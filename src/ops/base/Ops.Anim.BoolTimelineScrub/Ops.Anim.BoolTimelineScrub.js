this.name="Bool TimeLine Scrub";

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var state = this.addInPort(new Port(this,"state",OP_PORT_TYPE_VALUE,{display:'bool'}));
var v=this.addInPort(new Port(this,"anim value",OP_PORT_TYPE_VALUE));

var result=this.addOutPort(new Port(this,"result"));
var outTime=this.addOutPort(new Port(this,"time",OP_PORT_TYPE_VALUE));
var self=this;

var animTime=new CABLES.TL.Anim();

var lastState=false;
var toggle=function()
{

    if(state.get()!=lastState && v.anim)
    {
        lastState=state.get();
        animTime.clear();
        var t=Date.now()/1000;
        
        var l=v.anim.getLength();
        
        if(state.get())
        {
            animTime.setValue(t,0);
            animTime.setValue(t+l,l);
        }
        else
        {
            animTime.setValue(t,l);
            animTime.setValue(t+l,0);
        }
    }
}




var exec=function()
{
    var va=0;
    
    if(CABLES.UI)
    {
        if(!v.isAnimated())
        {
            self.uiAttr({'error':'anim value should be animated'});
            return;
        }
        else
        {
            self.uiAttr({'error':null});
        }
    }
    
    var t=Date.now()/1000;
    va=v.anim.getValue(animTime.getValue(t));

    if(result.get()!=va) result.set(va);

};

exe.onTriggered=exec;
state.onValueChanged=toggle;
