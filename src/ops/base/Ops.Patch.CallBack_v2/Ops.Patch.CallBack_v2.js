const exe=op.inTrigger("exe");
const callbackname=op.inString("Callback Name","myFunction");
const val0=op.inString("Parameter 1","");
const val1=op.inString("Parameter 2","");
const val2=op.inString("Parameter 3","");

var values=[0,0,0];

val0.onChange=function(){ values[0]=val0.get(); };
val1.onChange=function(){ values[1]=val1.get(); };
val2.onChange=function(){ values[2]=val2.get(); };

exe.onTriggered=function()
{
    if(op.patch.config.hasOwnProperty(callbackname.get()))
    {
        op.patch.config[callbackname.get()](values);
    }
    else
    {
        op.log('callback ', callbackname.get(), ' not found! Parameters: ', values);
    }
};
