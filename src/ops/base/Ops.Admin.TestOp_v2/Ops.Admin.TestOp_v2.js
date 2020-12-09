const paramtest_1 = op.inValueFloat("test float 1", 1.0);
const paramtest_2 = op.outNumber("test float 1", 1.0);
const slider = op.inFloatSlider("name", 15, 10, 20);

const onebuttion = op.inTriggerButton("Button");
const buttons = op.inUiTriggerButtons("buttons", ["a", "b", "hund", "&#9662;"]);

paramtest_1.setUiAttribs({ "hidePort": true });


op.onLoaded = function ()
{
    op.log("op loaded!");
};

buttons.onTriggered = function (e)
{
    op.log("BUTTON PRESSED", e);
};
