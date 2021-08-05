const
    inCount=op.inTriggerButton("Count"),
    inMin=op.inFloat("Step Min",0.5),
    inMax=op.inFloat("Step Max",1),
    outNum=op.outNumber("Result");

inCount.onTriggered=count;

let v=0;


function count()
{

    let r=Math.seededRandom() * (inMax.get() - inMin.get()) + inMin.get();

    if(Math.seededRandom()>0.5) v+=r;
    else v-=r;

    outNum.set(v);

}