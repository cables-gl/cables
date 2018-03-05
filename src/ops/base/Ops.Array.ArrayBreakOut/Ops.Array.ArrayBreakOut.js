// constants
var NUM_PORTS = 12;
var DEFAULT_VALUE_DEFAULT = 0;

// inputs
var inArrayPort = op.inArray('In Array');
var defaultValuePort = op.inValue('Default Value', DEFAULT_VALUE_DEFAULT);

// outputs
var valueOutPorts = createValuePorts();
var restArrayPort = op.outArray('Rest Array');

// change listeners
inArrayPort.onChange = update;
defaultValuePort.onChange = update;

// functions

 function update() {
     var arr = inArrayPort.get();
    if(!arr) { 
        resetOutPorts(); 
        return;
    } 
    for(var i=0; i<Math.min(arr.length, NUM_PORTS); i++) {
        valueOutPorts[i].set(arr[i]);
    }
    // set the remaining ports to the default value
    var defaultValue = defaultValuePort.get();
    for(var i=arr.length; i<NUM_PORTS; i++) {
        valueOutPorts[i].set(defaultValue);
        
    }
    restArrayPort.set(arr.slice(NUM_PORTS));
 }
 
 /**
  * Sets the ports to their default value, when there is no input array
  */
 function resetOutPorts() {
     var defaultValue = defaultValuePort.get();
     for(var i=0; i<NUM_PORTS; i++) {
        valueOutPorts[i].set(defaultValue);
        restArrayPort.set([]);
     }
 }

 /**
  * Creates the out ports
  */
 function createValuePorts() {
     var arr = [];
     for(var i=0; i<NUM_PORTS; i++) {
         arr[i] = op.outValue('Value ' + i);
     }
     return arr;
 }