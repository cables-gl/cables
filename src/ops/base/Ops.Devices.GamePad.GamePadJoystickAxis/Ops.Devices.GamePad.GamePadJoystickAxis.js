
var inAxis=op.inArray("Axis");
var inAxisNum=op.inValueInt("Index");
var outX=op.outValue("X");
var outY=op.outValue("Y");
var inDeadZone=op.outValue("DeadZone",0.1);

var outAngle=op.outValue("Angle");

inAxis.onChange=function()
{
    var arr=inAxis.get();
    if(!arr)return;

    var idx=inAxisNum.get()*2;

    var x=0;
    var y=0;
    
    if(arr[idx+0]>0)x=CABLES.map(arr[idx+0],inDeadZone.get(),1,0,1);
        else x=CABLES.map(arr[idx+0],-1,-inDeadZone.get(),-1,0);
    
    if(arr[idx+1]>0)y=CABLES.map(arr[idx+1],inDeadZone.get(),1,0,1);
        else y=CABLES.map(arr[idx+1],-1,-inDeadZone.get(),-1,0);

    outX.set(x);
    outY.set(y);

    if(x!=0 || y!=0)
    {
        var theta = Math.atan2(x, y);
    
        var angle=theta*180/Math.PI*-1;
        outAngle.set(360-(angle+180));
        
    }

};