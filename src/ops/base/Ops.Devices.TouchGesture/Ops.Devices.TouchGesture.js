// inputs
var enableVerticalSwipePort = op.inValueBool('Vertical Swipe', true);
var enableVerticalPanPort = op.inValueBool('Vertical Pan', true);

// outputs
var pressPort = op.outTrigger('Press');
var pressUpPort = op.outTrigger('Press Up');
var panLeftPort = op.outTrigger('Pan Left');
var panRightPort = op.outTrigger('Pan Right');
var swipeLeftPort = op.outTrigger('Swipe Left');
var swipeRightPort = op.outTrigger('Swipe Right');
var swipeUpPort = op.outTrigger('Swipe Up');
var swipeDownPort = op.outTrigger('Swipe Down');
var eventPort = op.outObject('Event');

var canvas = op.patch.cgl.canvas;

// create a simple instance
// by default, it only adds horizontal recognizers
var mc = new Hammer(canvas);

// change listeners
enableVerticalSwipePort.onChange = onEnableVerticalSwipePortChange;
enableVerticalPanPort.onChange = onEnableVerticalPanPortChange;

// init
onEnableVerticalSwipePortChange();
onEnableVerticalPanPortChange();

function onEnableVerticalSwipePortChange() {
    var direction = Hammer.DIRECTION_HORIZONTAL;
    if(enableVerticalSwipePort.get()) {
        direction = Hammer.DIRECTION_ALL;
    }
    mc.get('swipe').set({ direction: direction });
}

function onEnableVerticalPanPortChange() {
    var direction = Hammer.DIRECTION_HORIZONTAL;
    if(enableVerticalPanPort.get()) {
        direction = Hammer.DIRECTION_ALL;
    }
    mc.get('pan').set({ direction: direction });
}

/*
mc.on("panleft panright tap press", function(ev) {
    myElement.textContent = ev.type +" gesture detected.";
});
*/

mc.on('panleft', onPanLeft);
mc.on('panright', onPanRight);
mc.on('swipeleft', onSwipeLeft);
mc.on('swiperight', onSwipeRight);
mc.on('swipeup', onSwipeUp);
mc.on('swipedown', onSwipeDown);
mc.on('press', onPress);
mc.on('pressup', onPressUp);

function onPress(ev) {
    eventPort.set(ev);
    pressPort.trigger();
}

function onPressUp(ev) {
    eventPort.set(ev);
    pressUpPort.trigger();
}

function onPanLeft(ev) {
    eventPort.set(ev);
    panLeftPort.trigger();
}

function onPanRight(ev) {
    eventPort.set(ev);
    panRightPort.trigger();
}

function onSwipeLeft(ev) {
    eventPort.set(ev);
    swipeLeftPort.trigger();
}

function onSwipeRight(ev) {
    eventPort.set(ev);
    swipeRightPort.trigger();
}

function onSwipeUp(ev) {
    eventPort.set(ev);
    swipeUpPort.trigger();
}

function onSwipeDown(ev) {
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
