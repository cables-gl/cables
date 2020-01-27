const
    inStr=op.inString("String","default"),
    inNum=op.inInt("Num Lines",5),
    inRev=op.inBool("Reverse",false),
    inAppend=op.inBool("Force Num Lines",false),
    outStr=op.outString("Result","default");

var stringsNew=[];

inRev.onChange=
    inAppend.onChange=
    inStr.onChange=
    inNum.onChange=update;

function update()
{
    var strings=inStr.get().split('\n');
    const num=Math.min(Math.max(0, 16, inNum.get()));
    // const num=Math.floor(inNum.get());
    //result.set( Math.min(Math.max(val.get(), min.get()), max.get()));
    op.log("num is " + num);

    if(inRev.get())
    {
        if(strings.length>num)
        {
            for(var i=0;i<num;i++)
                stringsNew[num-i]=strings[strings.length-i];

            strings=stringsNew;
        }
    }
    else
    {
        strings.length=Math.min(num,strings.length);
    }

    var str=strings.join('\n');

    if(inAppend.get())
    {
        if(strings.length<num)
            for(var i=strings.length;i<num;i++)
                str+='\n';
    }

    outStr.set(str);

}