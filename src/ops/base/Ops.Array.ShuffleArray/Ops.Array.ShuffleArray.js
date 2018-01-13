op.name="ShuffleArray";

// vars
var arr=[];

// inputs
var exePort = op.inFunctionButton('Execute');
var shuffleOnChangePort = op.inValueBool('Shuffle on Change', true);
var array=op.addInPort(new Port(op, "array",OP_PORT_TYPE_ARRAY));

// outputs
var nextPort = op.outFunction('Next');
var arrayOut=op.addOutPort(new Port(op, "shuffled array",OP_PORT_TYPE_ARRAY));
array.ignoreValueSerialize=true;
arrayOut.ignoreValueSerialize=true;

/*
 * Taken from https://www.frankmitchell.org/2015/01/fisher-yates/
 */
function fisherYatesShuffle(array) {
  var i = 0
    , j = 0
    , temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

function update(port, newValue, forceShuffle) {
    var a=array.get();
    
    if(!a)return;
    if(arr.length!=a.length)
    {
        arr.length=a.length;
    }
    
    var j, x, i;
    
    for (i=0;i<a.length;i++) {
        arr[i]=a[i];
    }
    
    if(forceShuffle || shuffleOnChangePort.get()) {
        /*
        for (i=0;i<a.length;i++) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            arr[i - 1] = arr[j];
            arr[j] = x;
        }
        */
        fisherYatesShuffle(arr);
    }
    
    arrayOut.set(null);
    arrayOut.set(arr);
}

array.onValueChanged = update;

exePort.onTriggered = function() {
    update(null, null, true); // force shuffle
    nextPort.trigger();
};
