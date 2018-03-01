// constants
var CANVAS_ELEMENT = op.patch.cgl.canvas;

// variables
var lastParent = null;
var lastChild = null;

// inputs
var parentPort = op.inObject('Parent');
var childPort = op.inObject('Child');

// outputs
var parentOutPort = op.outObject('Parent Out');
var childOutPort = op.outObject('Child Out');

// change listeners
parentPort.onChange = update;
childPort.onChange = update;

// functions

function update() {
    var parent = parentPort.get();
    var child = childPort.get();
    if(parent !== lastParent) {
        if(parent) {
            handleParentConnect(parent, child);
        } else {
            handleParentDisconnect(parent, child);
        }
        lastParent = parent;
    }
    if(child !== lastChild) {
        if(child) {
            handleChildConnect(parent, child);
        } else {
            handleChildDisconnect(parent, child);
        }
        lastChild = child;
    }
    parentOutPort.set(parent);
    childOutPort.set(child);
}

function handleParentConnect(parent, child) {
    if(child) {
        parent.appendChild(child);
    }    
}

function handleParentDisconnect(parent, child) {
    if(child) {
        CANVAS_ELEMENT.appendChild(child); // if there is no parent, append to patch
    }
}

function handleChildConnect(parent, child) {
    if(parent) {
        parent.appendChild(child);
    }    
}

function handleChildDisconnect(parent, child) {
    if(lastChild) {
        CANVAS_ELEMENT.appendChild(lastChild);    
    }
}
