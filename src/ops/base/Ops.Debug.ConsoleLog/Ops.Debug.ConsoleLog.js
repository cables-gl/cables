const
    inNumber=op.inFloat("Number",0),
    inString=op.inString("String","");


inNumber.onChange=function()
{
    console.log(inNumber.get());
};

inString.onChange=function()
{
    console.log(inString.get());
};