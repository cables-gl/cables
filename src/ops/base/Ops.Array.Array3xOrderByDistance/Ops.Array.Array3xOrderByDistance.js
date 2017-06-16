op.name="Array3xOrderByDistance";

var inArr=op.inArray("Array");

var outArr=op.outArray("Result");


function compare(a, b)
{

    // return (a[0]*0.3+a[1]+a[2])-(b[0]*0.3+b[1]+b[2]);

	var xd = a[0]-b[0];
	var yd = a[1]-b[1];
	var zd = a[2]-b[2];
	
	return(Math.sqrt(xd*xd + yd*yd + zd*zd))-1.5;

    
}

var arrArr=[];

function sliceArray()
{
    var size = 3;
    arrArr.length=0;
    var bigarray=inArr.get();
    for (var i=0; i<bigarray.length; i+=size)
    {
        arrArr.push( bigarray.slice(i,i+size) );
    }

}


inArr.onChange=function()
{
    if(!inArr.get())return;
    sliceArray();
    
    arrArr.sort(compare);
    outArr.set(null);
    arrArr = [].concat.apply([], arrArr);

    outArr.set(arrArr);
};