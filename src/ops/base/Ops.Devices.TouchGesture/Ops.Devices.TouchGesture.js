// inputs
const inEnabled = op.inBool("Active", true);
let enableVerticalSwipePort = op.inValueBool("Vertical Swipe", true);
let enableVerticalPanPort = op.inValueBool("Vertical Pan", true);

// outputs
let pressPort = op.outTrigger("Press");
let pressUpPort = op.outTrigger("Press Up");
let panLeftPort = op.outTrigger("Pan Left");
let panRightPort = op.outTrigger("Pan Right");
let swipeLeftPort = op.outTrigger("Swipe Left");
let swipeRightPort = op.outTrigger("Swipe Right");
let swipeUpPort = op.outTrigger("Swipe Up");
let swipeDownPort = op.outTrigger("Swipe Down");
let eventPort = op.outObject("Event");

let canvas = op.patch.cgl.canvas;

// create a simple instance
// by default, it only adds horizontal recognizers
let mc = new Hammer(canvas);

// change listeners
enableVerticalSwipePort.onChange = onEnableVerticalSwipePortChange;
enableVerticalPanPort.onChange = onEnableVerticalPanPortChange;

// init
onEnableVerticalSwipePortChange();
onEnableVerticalPanPortChange();

function onEnableVerticalSwipePortChange()
{
    let direction = Hammer.DIRECTION_HORIZONTAL;
    if (enableVerticalSwipePort.get())
    {
        direction = Hammer.DIRECTION_ALL;
    }
    mc.get("swipe").set({ "direction": direction });
}

function onEnableVerticalPanPortChange()
{
    let direction = Hammer.DIRECTION_HORIZONTAL;
    if (enableVerticalPanPort.get())
    {
        direction = Hammer.DIRECTION_ALL;
    }
    mc.get("pan").set({ "direction": direction });
}

/*
mc.on("panleft panright tap press", function(ev) {
    myElement.textContent = ev.type +" gesture detected.";
});
*/

mc.on("panleft", onPanLeft);
mc.on("panright", onPanRight);
mc.on("swipeleft", onSwipeLeft);
mc.on("swiperight", onSwipeRight);
mc.on("swipeup", onSwipeUp);
mc.on("swipedown", onSwipeDown);
mc.on("press", onPress);
mc.on("pressup", onPressUp);

function onPress(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    pressPort.trigger();
}

function onPressUp(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    pressUpPort.trigger();
}

function onPanLeft(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    panLeftPort.trigger();
}

function onPanRight(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    panRightPort.trigger();
}

function onSwipeLeft(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    swipeLeftPort.trigger();
}

function onSwipeRight(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    swipeRightPort.trigger();
}

function onSwipeUp(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    swipeUpPort.trigger();
}

function onSwipeDown(ev)
{
    if (!inEnabled.get()) return;
    eventPort.set(ev);
    swipeDownPort.trigger();
}

/*
// By default it adds a set of tap, doubletap, press,
// horizontal pan and swipe, and the multi-touch pinch
// and rotate recognizers. The pinch and rotate recognizers
// are disabled by default because they would make the
// element blocking, but you can enable them by calling:
hammertime.get('pinch').set({ enable: true });
hammertime.get('rotate').set({ enable: true });

// Enabling vertical or all directions for the pan and swipe recognizers:
hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
hammertime.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
*/
