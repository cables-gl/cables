
var inTime=op.inValue("Time");

var inStart=op.inValueInt("Frame Start");
var inEnd=op.inValueInt("Frame End");
// var inLoop=op.inValueBool

var outTime=op.outValue("Result Time");
var outFrame=op.outValue("Result Frame");


inTime.onChange=function()
{
    var duration=(inEnd.get()-inStart.get())/30.0;
    
    var theTime=(inTime.get()%duration)+(inStart.get()/30);
    
    outTime.set( theTime );
    outFrame.set( Math.floor(theTime*30) );
    
    
    
};