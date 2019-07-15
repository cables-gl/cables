// vars
var arr=[];

// inputs
var exePort = op.inTriggerButton('Execute');
var inTrigShuffle = op.inTriggerButton("Shuffle array");
var array=op.inArray("array");

// outputs
var nextPort = op.outTrigger('Next');
var arrayOut=op.outArray("shuffled array");

array.ignoreValueSerialize=true;
arrayOut.ignoreValueSerialize=true;

/*
 * Taken from https://www.frankmitchell.org/2015/01/fisher-yates/
 */
function fisherYatesShuffle(array)
{
    var i = 0;
    var j = 0;
    var temp = null;

    for (i = array.length - 1; i > 0; i -= 1)
    {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function update() {
    var a=array.get();

    if(!a)return;
    if(arr.length!=a.length)
    {
        arr.length=a.length;
    }

    var i;

    for (i=0;i<a.length;i++) {
        arr[i]=a[i];
    }

    fisherYatesShuffle(arr);

    arrayOut.set(null);
    arrayOut.set(arr);
}

exePort.onTriggered = function() {
    //update();
    nextPort.trigger();
};
inTrigShuffle.onTriggered = function()
{
    update();
}

array.onLinkChanged = function ()
{
    update();
    nextPort.trigger();
}

