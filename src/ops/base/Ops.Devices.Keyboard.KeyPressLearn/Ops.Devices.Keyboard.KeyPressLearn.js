var learn = op.inTriggerButton("learn");
var learnedKeyCode = op.inValueInt("key code");
var canvasOnly=op.inValueBool("canvas only");
var modKey=op.inValueSelect("Mod Key",['none','alt']);
var inEnable=op.inValueBool("Enabled",true);
var preventDefault=op.inValueBool("Prevent Default");
var onPress=op.outTrigger("on press");
var onRelease=op.outTrigger("on release");
var outPressed=op.outValue("Pressed",false);

const cgl=op.patch.cgl;
var learning = false;

function onKeyDown(e)
{
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
                if(e.altKey===true)
                {
                    onPress.trigger();
                    outPressed.set(true);
                    if(preventDefault.get())e.preventDefault();
                }
            }
            else
            {
                onPress.trigger();
                outPressed.set(true);
                if(preventDefault.get())e.preventDefault();
            }

        }
    }
}

function onKeyUp(e) {
    if(e.keyCode == learnedKeyCode.get()) {
        // op.log("Key released, key code: " + e.keyCode);
        onRelease.trigger();
        outPressed.set(false);
    }
}

op.onDelete=function()
{
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
    outPressed.set(false);
}

function addCanvasListener() {
    cgl.canvas.addEventListener("keydown", onKeyDown, false );
    cgl.canvas.addEventListener("keyup", onKeyUp, false );
}

function addDocumentListener() {
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
}

inEnable.onChange=function()
{
    if(!inEnable.get())
    {
        removeListeners();
    }
    else
    {
        addListener();
    }
}

canvasOnly.onValueChange(function(){
    removeListeners();
    addListener();
});

canvasOnly.set(true);
addCanvasListener();
