var inArr=op.inArray("Array");
var what=op.inValueSelect("What",['None','X','Y','Z','XYZ']);
what.set("X");
var outArr=op.outArray("Result");

var comparator=compareX;
var arrArr=[];

op.toWorkPortsNeedToBeLinked(inArr);

function compareX(a, b){ return a[0]-b[0]; }
function compareY(a, b){ return a[1]-b[1]; }
// function compareZ(a, b){ return b[2]-a[2]; }
function compareZ(a, b){ return a[2]-b[2]; }
function compareXYZ(a, b){ return (a[0]+a[1]+a[2])-(b[0]+b[1]+b[2]); }

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

inArr.onChange=recalc;

function recalc()
{

    if(!Array.isArray(inArr.get()))
    {
        outArr.set(null);
        return;
    }
    if(!comparator)
    {
        outArr.set(null);
        outArr.set(inArr.get());
        return;
    }

    var start=performance.now();

    sliceArray();

    arrArr.sort(comparator);
    outArr.set(null);

    if(arrArr.flat)arrArr=arrArr.flat();
        else arrArr = [].concat.apply([], arrArr);

    outArr.set(null);
    outArr.set(arrArr);

};

what.onChange=function()
{
    // if(what.get()=='None')comparator=null;
    if(what.get()=='X')comparator=compareX;
    if(what.get()=='Y')comparator=compareY;
    if(what.get()=='Z')comparator=compareZ;
    if(what.get()=='XYZ')comparator=compareXYZ;
    recalc();
};
