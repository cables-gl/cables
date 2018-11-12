var exe=op.inTrigger("Exe");

var inIndex=op.inValueInt("Index");
var inNumber1=op.inValueInt("Number 1");
var inNumber2=op.inValueInt("Number 2");

var next=op.outTrigger("next");
var outFract=op.outValue("Fract");


exe.onTriggered=function()
{
    if(
        inIndex.get()>=Math.floor(inNumber1.get()) &&
        inIndex.get()<=inNumber2.get()+1
        )
        {
            var diff=inNumber2.get() - inIndex.get();

            if(inIndex.get()>Math.floor(inNumber2.get()))
            {
                outFract.set( 1.0+(inNumber2.get()-inIndex.get() ));
            }
            else 
            if(inIndex.get()<inNumber1.get())
            {
                outFract.set( 1.0-(inNumber1.get()-inIndex.get() ));
            }
            else outFract.set(1);

            next.trigger();

        }
    
};