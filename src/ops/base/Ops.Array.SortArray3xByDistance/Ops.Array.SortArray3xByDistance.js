const
    inArr=op.inArray("Array"),
    outArr=op.outArray("Result");

function dist(x1,y1,z1,x2,y2,z2)
{
	var xd = x2-x1;
	var yd = y2-y1;
	var zd = z2-z1;
	return Math.abs(Math.sqrt(xd*xd + yd*yd + zd*zd));
}

inArr.onChange=function()
{
    if(!inArr.get())return;

    var arr=inArr.get();

    if(arr.length==0)return;

    var data=[];
    var i=0;
    for(i=0;i<arr.length;i+=3)
    {
        data[i/3]={
            x:arr[i+0],
            y:arr[i+1],
            z:arr[i+2],
            found:false,
            pos:0
        };
    }

    var lastPoint=data[0];
    data[0].found=true;

    for(i=0;i<data.length;i++)
    {
        var smallest=null;
        var smallDist=999999999;

        for(var j=0;j<data.length;j++)
        {
            var d=dist(
                lastPoint.x,lastPoint.y,lastPoint.z,
                data[j].x,data[j].y,data[j].z
                );

            if(d<smallDist && !data[j].found )
            {
                smallDist=d;
                smallest=data[j];
            }
        }

        if(smallest)
        {
            smallest.pos=i;
            smallest.found=true;
            lastPoint=smallest;
        }
    }

    data.sort(function(a,b)
    {
        return a.pos-b.pos;
    });

    var outArray=[];
    for(i=0;i<data.length;i++)
    {
        outArray[i*3+0]=data[i].x;
        outArray[i*3+1]=data[i].y;
        outArray[i*3+2]=data[i].z;
    }
    outArr.set(outArray);

};