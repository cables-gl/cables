// must trigger from back to front (because of transparency) 

// constants
var BIG_INVALID_POSITION = 100000000000;
var DEFAULT_SIZE = 10;
var NUM_DEFAULT = 4;

// inputs
var triggerPort = op.inFunction('Execute');
var scrollValuePort = op.inValue('Scroll Position');
var numPort = op.inValue('Number of Elements', NUM_DEFAULT);
var sizePort = op.inValue('Size', DEFAULT_SIZE);
// var spacingPort = op.inValue('Spacing Between', 0.2);
// var loopPort = op.inValueBool('Loop');
// var minPort = op.inValue('Minimum', -80);
// var maxPort = op.inValue('Maximum', 80);

// outputs
var triggerItemPort = op.outFunction('Item Trigger');
var indexPort = op.outValue('Index');
var positionPort = op.outValue('Position');
// var beginningReachedPort = op.outFunction('Beginning Reached');
// var endReachedPort = op.outFunction('End Reached');
// var distBeginningPort = op.outValue('Item Dist Beginning');
var distCenterPort = op.outValue('Norm Position');
// var distEndPort = op.outValue('Item Dist End');
var nextPort = op.outFunction('Next');
var frontIndexPort = op.outValue('Front Index');
var frontPercentPort = op.outValue('Front Percentage');

// variables
var positions = [];
var size = DEFAULT_SIZE;
var minPosition = -DEFAULT_SIZE / 2;
var maxPosition = DEFAULT_SIZE / 2;
var num = NUM_DEFAULT;
var step = size / num;

// change listeners
triggerPort.onTriggered = update;
sizePort.onChange = updateSize;
numPort.onChange = updateNum;

function updateSize() {
    size = sizePort.get();
    minPosition = -size * 0.5;
    maxPosition = size * 0.5;
    updateStep();
}

function updateNum() {
    num = numPort.get();  
    updateStep();
}

function updateStep() {
    step = size * 1.0 / (num || 1); // prevent division by 0, not completely correct tho
}

// update
function update() {
    var smallestPos = BIG_INVALID_POSITION;
    var smallestIndex = -1;
    // var num = numPort.get();
    if(num <= 0) { return; } 
    var scrollValue = scrollValuePort.get();
    // var size = sizePort.get();
    // var step = size * 1.0 / num;
    for(var i=0; i<num; i++) {
        indexPort.set(i);
        var positionModulo = (scrollValue + i) % num;
        var position = map(positionModulo, 0, num, minPosition, maxPosition);
        positions[i] = position;
        if(position < smallestPos) {
            smallestPos = position;
            smallestIndex = i;
        }
    }
    // draw from back to front
    var frontMostIndex = -1;
    for(var i=smallestIndex; i<num; i++) {
        indexPort.set(i);
        positionPort.set(positions[i]);
        var distCenter = map(positions[i], minPosition, maxPosition, 0, 1, true);
        distCenterPort.set(distCenter);
        triggerItemPort.trigger(); 
        frontMostIndex = i;
    }
    for(var i=0; i<smallestIndex; i++) {
        indexPort.set(i);
        positionPort.set(positions[i]);
        var distCenter = map(positions[i], minPosition, maxPosition, 0, 1, true);
        distCenterPort.set(distCenter);
        triggerItemPort.trigger();    
        frontMostIndex = i;
    }
    frontIndexPort.set(frontMostIndex); // set the last index from the loop, this is the frontmost index    
    if(frontMostIndex !== -1) {
        var percentage = 1 - (maxPosition - positions[frontMostIndex]) / step;
        frontPercentPort.set(percentage);
    }
    nextPort.trigger();    
}

/**
 * Map Range, borrowed from p5.js: https://github.com/processing/p5.js/blob/207784ef276ed8c9c77b3b3fd708d5b25bbfa331/src/math/calculation.js
 *
 * @param  {Number} value  the incoming value to be converted
 * @param  {Number} start1 lower bound of the value's current range
 * @param  {Number} stop1  upper bound of the value's current range
 * @param  {Number} start2 lower bound of the value's target range
 * @param  {Number} stop2  upper bound of the value's target range
 * @param  {Boolean} [withinBounds] constrain the value to the newly mapped range
 */
function map(n, start1, stop1, start2, stop2, withinBounds) {
    // TODO: Check params
    var newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    if (!withinBounds) {
        return newval;
    }
    if (start2 < stop2) {
        return constrain(newval, start2, stop2);
    } else {
        return constrain(newval, stop2, start2);
    }
}

/**
 * Constrains a value between a minimum and maximum value,
 * borrowed from p5.js: https://github.com/processing/p5.js/blob/207784ef276ed8c9c77b3b3fd708d5b25bbfa331/src/math/calculation.js
 *
 * @method constrain
 * @param  {Number} n    number to constrain
 * @param  {Number} low  minimum limit
 * @param  {Number} high maximum limit
 * @return {Number}      constrained number
 */
function constrain(n, low, high) {
    // TODO: Check params
  return Math.max(Math.min(n, high), low);
}