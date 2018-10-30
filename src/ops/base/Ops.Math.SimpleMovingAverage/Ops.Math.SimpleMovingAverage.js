var val=op.inValue("Value");
var num=op.inValueInt("Number of Values",10);

var result=op.outValue("Result");

val.changeAlways=true;
var buffer=[];
var index=0;

num.onChange=init;
init();

function init()
{
    var n=Math.abs(Math.floor(num.get()));
    buffer.length=n;
    
    for(var i=0;i<buffer.length;i++)buffer[i]=null;
    index=0;
}


val.onChange=function()
{
    index++;
    if(index>=buffer.length)index=0;
    buffer[index]=val.get();
    
    var avg=0;
    var divide=0;
    for(var i=0;i<buffer.length;i++)
    {
        if(buffer[i]!==null) //ignore zeroes
        {
            avg+=buffer[i];
            divide++;
        }
    }

    result.set(avg/divide||1);
    
};