op.name="GaussianRandomArray";

var inNum=op.inValueInt("Num",100);
var outArr=op.outArray("Array");
var inDev=op.inValue("Deviation",1);

var arr=[];
var stdDev=1;

var nextGaussian=null;
inDev.onChange=inNum.onChange=update;
update();

// from https://github.com/processing/p5.js/blob/master/src/math/random.js

var previous=false;

function randomGaussian(mean, sd)  {
  var y1,x1,x2,w;
  if (previous) {
    y1 = y2;
    previous = false;
  } else {
    do {
      x1 = Math.random()*2 - 1;
      x2 = Math.random()*2 - 1;
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

    arr.length=Math.floor(inNum.get())||0;
    for(var i=0;i<arr.length;i++)
    {
        arr[i]=randomGaussian(0,stdDev);
    }

    outArr.set(arr);
}




