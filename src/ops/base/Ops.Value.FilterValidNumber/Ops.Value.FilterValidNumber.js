const
    inNumber=op.inFloat("Number",0),
    inZero=op.inBool("Invalid when 0",false),
    inSmaller=op.inBool("Invalid when <0",false),

    outNum=op.outNumber("Last Valid Number"),
    outValid=op.outBool("Is Valid");

inZero.onChange=
inSmaller.onChange=
inNumber.onChange=
    update;


function update()
{
    const num=inNumber.get();

    var r=true;

    if(num===null || num===undefined || num!=num) r=false;
    if(inZero.get() && num===0) r=false;
    if(inSmaller.get() && num<0) r=false;

    if(r) outNum.set(num);

    outValid.set(r);
}