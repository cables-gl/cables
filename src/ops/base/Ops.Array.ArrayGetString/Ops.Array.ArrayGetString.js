var array=op.inArray("array");
var index=op.inValueInt("index");

//when out is set to op.outString then index.onChange doesn't work
var result=op.outString("result");//original code

//setting it to a op.outValue does work on change
//var result=op.outValue("result");

array.ignoreValueSerialize=true;

index.onChange=update;
var arr=null;

array.onChange=function()
{
    arr=array.get();
    update();
};

function update()
{
    if(arr) result.set( arr[index.get()]);
}