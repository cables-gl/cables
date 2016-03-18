Op.apply(this, arguments);
var self=this;

this.name='logger';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var valueInput=this.addInPort(new Port(this,"value input"));
valueInput.set('');
var arrayInput=this.addInPort(new Port(this,"array input", OP_PORT_TYPE_ARRAY));
arrayInput.set('');
/*var objectInput=this.addInPort(new Port(this,"object input", OP_PORT_TYPE_OBJECT));
objectInput.set('');*/

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (var i = 0, len = arr1.length; i < len; i++){
        if (arr1[i] !== arr2[i]){
            return false;
        }
    }
    return true; 
}

var oldArr = [];
var oldObj = {};

var printValue = function(){
    if(valueInput.get()) {
        if(valueInput.links && valueInput.links.length > 0) {
            self.log("[" + valueInput.links[0].portOut.parent.name + ": " + valueInput.links[0].portOut.name + "] " + valueInput.get());
        } else {
            self.log("[value] " + valueInput.get());
        }
    }
}

var printArray = function(){
    if( arrayInput.get()){
        if(Array.isArray( arrayInput.get() )){
            if(arrayInput.links && arrayInput.links.length > 0) {
                self.log("[" + arrayInput.links[0].portOut.parent.name + ": " + arrayInput.links[0].portOut.name + "] " + arrayInput.get());
            } else {
                self.log("[array] " + arrayInput.get());
            }
            //oldArr =  arrayInput.get().slice();    
        } else {
            self.log("[array]" + "No array!");    
        }
    }
};

var printObject = function(){
    if(objectInput.get()) {
        if(objectInput.links && objectInput.links.length > 0) {
            self.log("[" + objectInput.links[0].portOut.parent.name + ": " + objectInput.links[0].portOut.name + "] " + JSON.stringify(objectInput.get()));
        } else {
            self.log("[array] " + JSON.stringify(objectInput.get()));
        }
    }
}

exe.onTriggered = function(){
    printValue();    
    printArray();    
};

valueInput.onValueChanged = printValue;
arrayInput.onValueChanged = printArray;
/*objectInput.onValueChanged = printObject;*/

/*objectInput.onValueChanged = function(){
    if(objectInput.links && objectInput.links.length > 0) {
        self.log("[" + objectInput.links[0].portOut.parent.name + ": " + objectInput.links[0].portOut.name + "] " + JSON.stringify(objectInput.get()));
    }
};*/
