const index=op.inValueInt("index");
const seed=op.inValueFloat("random seed");
const min=op.inValueFloat("Min");
const max=op.inValueFloat("Max");
const outX=op.outValue("X");
const outY=op.outValue("Y");
const outZ=op.outValue("Z");

var numValues=100;
min.set(-1);
max.set(1);
seed.set(Math.round(Math.random()*99999));

max.onChange=init;
min.onChange=init;
seed.onChange=init;

var arr=[];
init();

index.onChange=function()
{
    var idx=Math.floor(index.get())||0;
    if(idx*3>=arr.length)
    {
        numValues=idx+100;
        init();
    }

    idx*=3;

    outX.set(arr[idx+0]);
    outY.set(arr[idx+1]);
    outZ.set(arr[idx+2]);
};

function init()
{
    Math.randomSeed=seed.get();

    arr.length=Math.floor(numValues*3) || 300;
    for(var i=0;i<arr.length;i+=3)
    {
        arr[i+0]=Math.seededRandom()* ( max.get() - min.get() ) + min.get() ;
        arr[i+1]=Math.seededRandom()* ( max.get() - min.get() ) + min.get() ;
        arr[i+2]=Math.seededRandom()* ( max.get() - min.get() ) + min.get() ;
    }
}
