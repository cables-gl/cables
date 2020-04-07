const paramtest_1 = op.inValueFloat("test float 1",1.0);
const paramtest_2 = op.inValueFloat("test float 2",1.0);

const onebuttion=op.inTriggerButton("Button");
const buttons=op.inUiTriggerButtons("buttons",["a","b","hund","&#9662;"]);

op.onLoaded=function()
{
    console.log("op loaded!");
}

buttons.onTriggered=function(e)
{
    console.log('BUTTON PRESSED',e);

};