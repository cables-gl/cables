const exec=op.inTrigger("Render");
const inNum=op.inValueInt("Num",400);
const inC=op.inValue("Scale",0.1);
const inI=op.inValue("Param",100);

const outArr=op.outArray("Coordinates");

const arr=[];

inNum.onChange=update;
inC.onChange=update;
inI.onChange=update;

function update()
{
    arr.length=Math.floor(inNum.get()*3);

    var n=inNum.get();
    var c=inC.get();
    
    var ii=inI.get();
    
    for (var i = 0; i < n; i++)
    {
        var a = i * ii;
        var r = c * Math.sqrt(i);
        var x = r * Math.cos(a);
        var y = r * Math.sin(a);
        var hu = i/3.0 % 360;
        
        arr[i*3+0]=x;
        arr[i*3+1]=y;
        arr[i*3+2]=0;
    }
    outArr.set(null);
    outArr.set(arr);
}

update();