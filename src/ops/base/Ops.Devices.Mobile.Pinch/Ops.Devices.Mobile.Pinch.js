// constants

const initialScale = 1.0;

// inputs
const enabledPort = op.inBool("Enabled", true);
const minScalePort = op.inFloat("Min Scale", 0.0);
const maxScalePort = op.inFloat("Max Scale", 4.0);
const resetScalePort = op.inTriggerButton("Reset Scale");
const inLimit = op.inBool("Limit", true);

// variables
let scale = initialScale;
let tmpScale = initialScale;
let pinchInProgress = false;

// setup
const el = op.patch.cgl.canvas;
const hammertime = new Hammer(el);
hammertime.get("pinch").set({ "enable": true });

// outputs
const scalePort = op.outNumber("Scale", 1);
const eventPort = op.outObject("Event Details");
const outDelta = op.outNumber("Delta");

// change listeners
window.addEventListener("gesturestart", (e) => { return e.preventDefault(); });
window.addEventListener("gesturechange", (e) => { return e.preventDefault(); });
window.addEventListener("gestureend", (e) => { return e.preventDefault(); });

hammertime.on("pinch", function (ev)
{
    ev.preventDefault(); // this is ignored in some browsers
    if (!enabledPort.get()) { return; }

    // if(ev.isFinal || ev.isFirst) { op.log(ev); }

    tmpScale = ev.scale;
    pinchInProgress = true;

    // if(ev.isFinal || !ev.isFinal && pinchInProgress) {
    const oldScale = scale;
    outDelta.set(0);

    if (ev.isFinal)
    {
        scale *= tmpScale;
        scale = checkAndCorrectBoundaries(scale);

        scalePort.set(scale);
        pinchInProgress = false;
        tmpScale = initialScale;
    }
    else
    {
        scalePort.set(checkAndCorrectBoundaries(scale * tmpScale));
    }

    let d = oldScale - scalePort.get();
    if (d < 0) d = -1;
    else if (d > 0) d = 1;

    outDelta.set(d);

    // if(ev.additionalEvent) {
    /*
    if(ev.additionalEvent === 'pinchin') {
        scale -=  Math.abs(ev.velocity);
    } else if (ev.additionalEvent === 'pinchout') {
        scale += Math.abs(ev.velocity);
    }
    */
    // }
    // scale += ev.velocity;
    /*
		tmpScale = ev.scale;

	var scaleToSet;
	if(ev.isFinal) {
	    scale *= tmpScale;
	    scaleToSet = scale;
	    tmpScale = initialScale;
	} else {
	    scaleToSet = scale * tmpScale;
	}


	scale = checkAndCorrectBoundaries(scale);
	scaleToSet = checkAndCorrectBoundaries(scaleToSet);

	scalePort.set(scaleToSet);
	*/
});

el.addEventListener("touchend", function (ev)
{
    if (pinchInProgress)
    {
        ev.preventDefault(); // this is ignored in some browsers
        ev.stopPropagation();
        pinchInProgress = false;
        scale *= tmpScale;
        scale = checkAndCorrectBoundaries(scale);
        tmpScale = initialScale;
        scalePort.set(scale);
    }
});

function checkAndCorrectBoundaries(s)
{
    let correctedS = s;

    if (inLimit.get())
    {
        if (s < minScalePort.get())
        {
            correctedS = minScalePort.get();
        }
        else if (s > maxScalePort.get())
        {
            correctedS = maxScalePort.get();
        }
    }
    return correctedS;
}

resetScalePort.onTriggered = reset;

// functions

function reset()
{
    scale = initialScale;
    scalePort.set(scale);
}
