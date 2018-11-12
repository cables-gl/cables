var CHANGE_ALWAYS_DEFUALT = false;

var val=op.inValue("Value");
val.changeAlways = CHANGE_ALWAYS_DEFUALT;
var changeAlwaysPort = op.inValueBool('Change Always', CHANGE_ALWAYS_DEFUALT);
var result=op.outValue("Delta");

var oldVal=0;

changeAlwaysPort.onChange = function() {
    val.changeAlways = changeAlwaysPort.get();    
};

val.onChange=function()
{
    var change=oldVal-val.get();
    oldVal=val.get();
    result.set(change);
};

