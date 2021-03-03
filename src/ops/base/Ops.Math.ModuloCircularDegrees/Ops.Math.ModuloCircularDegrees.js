const
    inVal=op.inFloat("Number",0),
    outAbs=op.outNumber("Absolute Degrees"),
    outDeg=op.outNumber("Modulo Degrees");


let oldValue=0;

inVal.onChange=update;

function update()
{
    let v=inVal.get();

    outDeg.set(v%360);

    if(oldValue-v>179)v+=360;
    if(oldValue-v<-179)v-=360;

    outAbs.set(v);

    oldValue=v;

}
