const
    inNum=op.inValueInt("Num Triplets",100),
    inX=op.inValueFloat("X",0),
    inY=op.inValueFloat("Y",0),
    inZ=op.inValueFloat("Z",0),
    outArr=op.outArray("Array");

inNum.onChange=
    inX.onChange=
    inY.onChange=
    inZ.onChange=update;

var arr=[];
update();

function update()
{
    const num=inNum.get()*3;
    if(arr.length!=num) arr.length=num;

    const x=inX.get();
    const y=inY.get();
    const z=inZ.get();

    for(var i=0;i<num;i+=3)
    {
        arr[i]=x;
        arr[i+1]=y;
        arr[i+2]=z;
    }

    outArr.set(null);
    outArr.set(arr);
}