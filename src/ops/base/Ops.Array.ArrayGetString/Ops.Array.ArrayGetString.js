var array=op.inArray("array");
var index=op.inValueInt("index");
var result=op.outString("result");
array.ignoreValueSerialize=true;

index.onChange=update;
var arr=null;

function update()
{
    if(arr) result.set( arr[index.get()]);
}


array.onChange=function()
{
    arr=array.get();
    update();
};
