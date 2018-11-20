// var canvasOnly=op.addInPort(new CABLES.Port(op,"canvas only",CABLES.OP_PORT_TYPE_VALUE, {"display": "bool"}));

const
    canvasOnly=op.inValueBool("canvas only",true),
    keysCursor=op.inValueBool("Cursor Keys",true),
    keysWasd=op.inValueBool("WASD",true),
    pressedUp=op.outValue("Up"),
    pressedDown=op.outValue("Down"),
    pressedLeft=op.outValue("Left"),
    pressedRight=op.outValue("Right");

const cgl=op.patch.cgl;

function onKeyDown(e)
{
    if(keysWasd.get())
    {
        if(e.keyCode==87) pressedUp.set(true);
        if(e.keyCode==83) pressedDown.set(true);
        if(e.keyCode==65) pressedLeft.set(true);
        if(e.keyCode==68) pressedRight.set(true);
    }
    if(keysCursor.get())
    {
        if(e.keyCode==38) pressedUp.set(true);
        if(e.keyCode==40) pressedDown.set(true);
        if(e.keyCode==37) pressedLeft.set(true);
        if(e.keyCode==39) pressedRight.set(true);
    }
}

function onKeyUp(e)
{
    if(keysWasd.get())
    {
        if(e.keyCode==87) pressedUp.set(false);
        if(e.keyCode==83) pressedDown.set(false);
        if(e.keyCode==65) pressedLeft.set(false);
        if(e.keyCode==68) pressedRight.set(false);
    }
    if(keysCursor.get())
    {
        if(e.keyCode==38) pressedUp.set(false);
        if(e.keyCode==40) pressedDown.set(false);
        if(e.keyCode==37) pressedLeft.set(false);
        if(e.keyCode==39) pressedRight.set(false);
    }
}

op.onDelete=function()
{
    cgl.canvas.removeEventListener('keyup', onKeyUp, false);
    cgl.canvas.removeEventListener('keydown', onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    document.removeEventListener("keydown", onKeyDown, false);
};


function addListener()
{
    if(canvasOnly.get() === true) addCanvasListener();
        else addDocumentListener();
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
