op.name="CursorKeys";

var canvasOnly=op.addInPort(new Port(op,"canvas only",OP_PORT_TYPE_VALUE, {"display": "bool"}));

var pressedUp=op.outValue("Up");
var pressedDown=op.outValue("Down");
var pressedLeft=op.outValue("Left");
var pressedRight=op.outValue("Right");


var cgl=op.patch.cgl;

function onKeyDown(e) 
{
    if(e.keyCode==38) pressedUp.set(true);
    if(e.keyCode==40) pressedDown.set(true);
    if(e.keyCode==37) pressedLeft.set(true);
    if(e.keyCode==39) pressedRight.set(true);
}

function onKeyUp(e)
{
    if(e.keyCode==38) pressedUp.set(false);
    if(e.keyCode==40) pressedDown.set(false);
    if(e.keyCode==37) pressedLeft.set(false);
    if(e.keyCode==39) pressedRight.set(false);
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
