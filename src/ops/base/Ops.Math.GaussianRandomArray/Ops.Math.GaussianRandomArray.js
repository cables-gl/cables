var inNum=op.inValueInt("Num",100);
var outArr=op.outArray("Array");
var inDev=op.inValue("Deviation",1);
var seed=op.addInPort(new CABLES.Port(op,"Random Seed"));


var arr=[];
var stdDev=1;

var nextGaussian=null;
seed.onChange=inDev.onChange=inNum.onChange=update;
update();

// from https://github.com/processing/p5.js/blob/master/src/math/random.js

var previous=false;

var y2;
function randomGaussian(mean, sd)  {
  var y1,x1,x2,w;
  if (previous) {
    y1 = y2;
    previous = false;
  } else {
    do {
      x1 = Math.seededRandom()*2 - 1;
      x2 = Math.seededRandom()*2 - 1;
      w = x1 * x1 + x2 * x2;
    } while (w >= 1);
    w = Math.sqrt((-2 * Math.log(w))/w);
    y1 = x1 * w;
    y2 = x2 * w;
    previous = true;
  }

  var m = mean || 0;
  var s = sd || 1;
  return y1*s + m;
}


function update()
{
    stdDev=inDev.get();
    Math.randomSeed=seed.get();

    arr.length=Math.floor(inNum.get())||0;
    for(var i=0;i<arr.length;i++)
    {
        arr[i]=randomGaussian(0,stdDev);
    }

    outArr.set(null);
    outArr.set(arr);
}




