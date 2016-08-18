this.name="Ops.Devices.Keyboard.KeyPressLearn";

var op = this;
var cgl=this.patch.cgl;

var onPress=this.addOutPort(new Port(this,"on press",OP_PORT_TYPE_FUNCTION));
var onRelease=this.addOutPort(new Port(this,"on release",OP_PORT_TYPE_FUNCTION));
var learn = this.addInPort( new Port( this, "learn", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var learnedKeyCode = this.addInPort( new Port( this, "key code", OP_PORT_TYPE_VALUE));
var canvasOnly=this.addInPort(new Port(this,"canvas only",OP_PORT_TYPE_VALUE, {"display": "bool"}));

var modKey=op.addInPort(new Port(op,"Mod Key",OP_PORT_TYPE_VALUE ,{display:'dropdown',values:['none','alt']} ));

var learning = false;

function onKeyDown(e) 
{
    
    // console.log(e);
    if(learning){
        learnedKeyCode.set(e.keyCode);
        if(CABLES.UI){
            gui.patch().showOpParams(op);
        }
        // op.log("Learned key code: " + learnedKeyCode.get());
        learning = false;
        removeListeners();
        addListener();
    } else {
        if(e.keyCode == learnedKeyCode.get()){
            
            if(modKey.get()=='alt' )
            {
                if(e.altKey==true)
                {
                    onPress.trigger();
                }
            }
            else 
            onPress.trigger();
            
            
            // op.log("Key pressed, key code: " + e.keyCode);
            
        }
    }
}

function onKeyUp(e) {
    if(e.keyCode == learnedKeyCode.get()) {
        // op.log("Key released, key code: " + e.keyCode);
        onRelease.trigger();
    }
}

this.onDelete=function() {
    // console.log("Remove keypress op...");
    cgl.canvas.removeEventListener('keyup', onKeyUp, false);
    cgl.canvas.removeEventListener('keydown', onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    document.removeEventListener("keydown", onKeyDown, false);
};

learn.onTriggered = function(){
    // op.log("Listening for key...");
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
    document.removeEventListener("keydown", onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    cgl.canvas.removeEventListener('keydown', onKeyDown, false);
    cgl.canvas.removeEventListener('keyup', onKeyUp, false);
}

function addCanvasListener() {
    cgl.canvas.addEventListener("keydown", onKeyDown, false );
    cgl.canvas.addEventListener("keyup", onKeyUp, false );
}

function addDocumentListener() {
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
}

canvasOnly.onValueChange(function(){
    removeListeners();
    addListener();
});

canvasOnly.set(true);
addCanvasListener();
