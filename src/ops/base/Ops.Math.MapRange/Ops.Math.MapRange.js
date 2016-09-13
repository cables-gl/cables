op.name='map value range';
var result=op.addOutPort(new Port(op,"result"));
var v=op.addInPort(new Port(op,"value"));
var old_min=op.addInPort(new Port(op,"old min"));
var old_max=op.addInPort(new Port(op,"old max"));
var new_min=op.addInPort(new Port(op,"new min"));
var new_max=op.addInPort(new Port(op,"new max"));

var easing=op.inValueSelect("Easing",["Linear","Smoothstep","Smootherstep"],"Linear");


var ease=0;
var r=0;

easing.onChange=function()
{
    if(easing.get()=="Smoothstep") ease=1;
    else if(easing.get()=="Smootherstep") ease=2;
    else ease=0;
};

function exec()
{
    if(v.get()>old_max.get())
    {
        result.set(new_max.get());
        return;
    }
    else
    if(v.get()<old_min.get())
    {
        result.set(new_min.get());
        return;
    }


    var nMin=new_min.get();
    var nMax=new_max.get();
    var oMin=old_min.get();
    var oMax=old_max.get();
    var x=v.get();

    var reverseInput = false;
    var oldMin = Math.min( oMin, oMax );
    var oldMax = Math.max( oMin, oMax );
    if(oldMin!= oMin) reverseInput = true;

    var reverseOutput = false;
    var newMin = Math.min( nMin, nMax );
    var newMax = Math.max( nMin, nMax );
    if(newMin != nMin) reverseOutput = true;

    var portion=0;

    if(reverseInput) portion = (oldMax-x)*(newMax-newMin)/(oldMax-oldMin);
        else portion = (x-oldMin)*(newMax-newMin)/(oldMax-oldMin);
    
    
    
    if(reverseOutput) r=newMax - portion;
        else r=portion + newMin;

    
    if(ease===0)
    {
        result.set(r);
    }
    else
    if(ease==1)
    {
        x = Math.max(0, Math.min(1, (r-nMin)/(nMax-nMin)));
        result.set( nMin+x*x*(3 - 2*x)* (nMax-nMin) ); // smoothstep
    }
    else
    if(ease==2)
    {
        x = Math.max(0, Math.min(1, (r-nMin)/(nMax-nMin)));
        result.set( nMin+x*x*x*(x*(x*6 - 15) + 10) * (nMax-nMin) ) ; // smootherstep

    }

    

}

v.set(0);
old_min.set(-1);
old_max.set(1);
new_min.set(0);
new_max.set(1);


v.onValueChanged=exec;
old_min.onValueChanged=exec;
old_max.onValueChanged=exec;
new_min.onValueChanged=exec;
new_max.onValueChanged=exec;

exec();