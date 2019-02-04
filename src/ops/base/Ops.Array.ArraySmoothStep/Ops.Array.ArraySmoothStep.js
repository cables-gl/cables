var inArray=op.inArray("Array In");
var inMinimum=op.inValue("Min",0.0);
var inMaximum=op.inValue("Max",1.0);
var outArray=op.outArray("Array out");

var newArr=[];
outArray.set(newArr);

inArray.onChange=
inMinimum.onChange=
inMaximum.onChange = inArray.onChange=function()
{
    var arr=inArray.get();
    if(!arr)return;

    var min=inMinimum.get();
    var max=inMaximum.get();

    if(newArr.length!=arr.length)newArr.length=arr.length;

    for(var i=0;i<arr.length;i++)
    {
        newArr[i] = smoothstep(min,max,arr[i]);
    }
    outArray.set(null);
    outArray.set(newArr);
};

function smoothstep (min, max, value)
{
  var x = Math.max(0.0, Math.min(1.0, (value-min) / (max-min)));
  return x * x * (3 - 2 * x);
}