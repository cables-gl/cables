
const
    inStr=op.inString("String"),
    outStr=op.outValue("Result");

inStr.onChange=function(){
    const str=inStr.get();

    if(str!==0) outStr.set(str);
};