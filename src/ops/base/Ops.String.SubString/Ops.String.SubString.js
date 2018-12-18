var inStr=op.inValueString("String","cables");
var inStart=op.inValueInt("Start",0);
var inEnd=op.inValueInt("End",4);
var result=op.outValue("Result");

inStr.onChange=
inStart.onChange=
inEnd.onChange=
function()
{
    var start=inStart.get();
    var end=inEnd.get();
    var str=inStr.get()+'';
    result.set( str.substring(start,end) );
};