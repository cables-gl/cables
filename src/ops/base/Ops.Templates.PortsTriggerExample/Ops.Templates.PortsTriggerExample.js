//Create a input port of the type Trigger
const inExecute  = op.inTrigger("Trigger In",{"display": "button"});
//create a button in UI panel of the op which can be clicked
const inButton   = op.inTriggerButton("Press me");

//Create a output port of the type Trigger
const outTrigger = op.outTrigger("Trigger out");

//when input port is triggered call the function 'update'
inExecute.onTriggered = update;
//if user presses the button in the op pane call function 'update'
inButton.onTriggered = update;

//this function runs every time the input port is triggered
function update()
{
    //send a trigger out of the output port
    outTrigger.trigger();
}