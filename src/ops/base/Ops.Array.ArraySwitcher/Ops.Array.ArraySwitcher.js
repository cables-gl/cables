var N_PORTS = 8;

// input ports
var inTrigger1 = op.inTriggerButton("Trigger 1");
var inArray1 = op.inArray("Array 1");
var inTrigger2 = op.inTriggerButton("Trigger 2");
var inArray2 = op.inArray("Array 2");
var inTrigger3 = op.inTriggerButton("Trigger 3");
var inArray3 = op.inArray("Array 3");
var inTrigger4 = op.inTriggerButton("Trigger 4");
var inArray4 = op.inArray("Array 4");
var inTrigger5 = op.inTriggerButton("Trigger 5");
var inArray5 = op.inArray("Array 5");
var inTrigger6 = op.inTriggerButton("Trigger 6");
var inArray6 = op.inArray("Array 6");
var inTrigger7 = op.inTriggerButton("Trigger 7");
var inArray7 = op.inArray("Array 7");
var inTrigger8 = op.inTriggerButton("Trigger 8");
var inArray8 = op.inArray("Array 8");

// output ports
var outArray = op.outArray("Out Array");

// change listeners
inTrigger1.onTriggered = function() {
    outArray.set(inArray1.get());
};
inTrigger2.onTriggered = function() {
    outArray.set(inArray2.get());
};
inTrigger3.onTriggered = function() {
    outArray.set(inArray3.get());
};
inTrigger4.onTriggered = function() {
    outArray.set(inArray4.get());
};
inTrigger5.onTriggered = function() {
    outArray.set(inArray5.get());
};
inTrigger6.onTriggered = function() {
    outArray.set(inArray6.get());
};
inTrigger7.onTriggered = function() {
    outArray.set(inArray7.get());
};
inTrigger8.onTriggered = function() {
    outArray.set(inArray8.get());
};

// input ports
/*
var inTriggers = [];
var inArrays = [];
for(var i=0; i<N_PORTS; i++) {
    var triggerPort = op.inTrigger("Trigger " + i);
    inTriggers.push(triggerPort);
    var arrPort = op.inArray("Array " + i);
    inArrays.push(arrPort);
    triggerPort.onTriggered = function() {
        outArray.set(arrPort.get() || [] );
        op.log("Array set to ", arrPort.get());
    };
}
*/
