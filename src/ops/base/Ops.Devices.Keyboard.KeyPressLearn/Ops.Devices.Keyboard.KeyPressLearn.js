this.name="Ops.Devices.Keyboard.KeyPressLearn";

var op = this;
var cgl=this.patch.cgl;

var onPress=this.addOutPort(new Port(this,"on press",OP_PORT_TYPE_FUNCTION));
var learn = this.addInPort( new Port( this, "learn", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var learnedKeyCode = this.addInPort( new Port( this, "learned key code", OP_PORT_TYPE_VALUE));
var canvasOnly=this.addInPort(new Port(this,"canvas only",OP_PORT_TYPE_VALUE, {"display": "bool"}));

var learning = false;

function onKeyPress(e) {
    if(learning){
        learnedKeyCode.set(e.keyCode);
        if(CABLES.UI){
            gui.patch().showOpParams(op);
        }
        op.log("Learned key code: " + learnedKeyCode.get());
        learning = false;
        removeListeners();
        addListener();
    } else {
        if(e.keyCode == learnedKeyCode.get()) {
            op.log("Learned key pressed, key code: " + e.keyCode);
            onPress.trigger();
        }
    }
}

this.onDelete=function() {
    console.log("remove keypress op...");
    cgl.canvas.removeEventListener('keypress', onKeyPress, false);
    document.removeEventListener("keypress", onKeyPress, false);
};

learn.onTriggered = function(){
    op.log("Listening for key...");
    learning = true;
    addDocumentListener();

    setTimeout(function(){
        learning = false;
        removeListeners();
        addListener();
    }, 3000);
};

function addListener() {
    if(canvasOnly.get() === true) {
        addCanvasListener();
    } else {
        addDocumentListener();
    }
}

function removeListeners() {
    document.removeEventListener("keypress", onKeyPress, false);
    cgl.canvas.removeEventListener('keypress', onKeyPress, false);
}

function addCanvasListener() {
    cgl.canvas.addEventListener("keypress", onKeyPress, false );
}

function addDocumentListener() {
    document.addEventListener("keypress", onKeyPress, false);
}

canvasOnly.onValueChange(function(){
    removeListeners();
    addListener();
});

canvasOnly.set(true);
addCanvasListener();
