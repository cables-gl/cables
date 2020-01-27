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
    var num=num=Math.max(0,Math.floor(inNum.get())+1);

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