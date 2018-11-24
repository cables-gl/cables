const
    str=op.inString("String",5711),
    outNum=op.outValue("Number");

str.onChange=function()
{
    var num=parseFloat(str.get());
    if(num!=num) num=0;
    outNum.set(num);
};

