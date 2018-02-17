
var anim=new CABLES.TL.Anim();

var update=op.inFunction("Update");

var duration1=op.inValue("Duration Out",0.25);
var easing1=anim.createPort(op,"Easing Out");
var value1=op.inValue("Value Out",0);

var duration2=op.inValue("Duration In",0.25);
var easing2=anim.createPort(op,"Easing In");
var value2=op.inValue("Value In",1);

var trigger=op.inFunctionButton("Start");
var next=op.outFunction("Next");

var outVal=op.outValue("Result",0);

var middle=op.outFunction("Middle");

trigger.onTriggered=setupAnim;


// outVal.set(1);


update.onTriggered=function()
{
    var time=CABLES.now()/1000.0;
    if(anim.isStarted(time)) outVal.set(anim.getValue(time));
        else outVal.set(value2.get());
};

value2.onChange=function()
{
    outVal.set(value2.get());
};

function setupAnim()
{
    anim.clear();
    anim.setValue(CABLES.now()/1000.0, value2.get());
    
    anim.setValue(CABLES.now()/1000.0+
                        duration1.get(), value1.get(),function()
                        {
                            middle.trigger();
                        });

    anim.setValue(CABLES.now()/1000.0+
                        duration1.get()+
                        duration2.get(), value2.get());

    anim.keys[0].setEasing(
        anim.easingFromString( easing1.get()) );

    anim.keys[1].setEasing(
        anim.easingFromString( easing2.get()) );

}