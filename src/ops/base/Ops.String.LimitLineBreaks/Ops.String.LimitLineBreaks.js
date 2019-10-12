const
    inStr=op.inString("String","default"),
    inNum=op.inInt("Num Lines",5),
    inRev=op.inBool("Reverse",false),
    outStr=op.outString("Result","default");

var stringsNew=[];

inStr.onChange=
inNum.onChange=function()
{
    var strings=inStr.get().split('\n');

    if(inRev.get())
    {

        var num=inNum.get();
        if(strings.length>num)
        {
            for(var i=0;i<num;i++)
                stringsNew[num-i]=strings[strings.length-i];

            strings=stringsNew;
        }
    }
    else
    {
        strings.length=Math.min(inNum.get(),strings.length);
    }

    outStr.set(strings.join('\n'));

};