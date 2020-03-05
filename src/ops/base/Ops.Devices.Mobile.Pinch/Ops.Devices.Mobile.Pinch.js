// constants
var elId = 'glcanvas';
var initialScale = 1.0;

// inputs
var enabledPort = op.inValueBool('Enabled', true);
var minScalePort = op.inValue('Min Scale', 0.0);
var maxScalePort = op.inValue('Max Scale', 4.0);
var resetScalePort = op.inTriggerButton('Reset Scale');

// variables
var scale = initialScale;
var tmpScale = initialScale;
var pinchInProgress = false;

// setup
var el = document.getElementById(elId);
var hammertime = new Hammer(el);
hammertime.get('pinch').set({ enable: true });

// outputs
var scalePort = op.outValue('Scale', 1);
var eventPort = op.outObject('Event Details');


// change listeners

hammertime.on('pinch', function(ev) {
    op.log(ev.additionalEvent);
    ev.preventDefault(); // this is ignored in some browsers
    if(!enabledPort.get()) { return; }

    // if(ev.isFinal || ev.isFirst) { op.log(ev); }

    tmpScale = ev.scale;
    pinchInProgress = true;

    //if(ev.isFinal || !ev.isFinal && pinchInProgress) {
    if(ev.isFinal) {
        scale *= tmpScale;
        scale = checkAndCorrectBoundaries(scale);
        scalePort.set(scale);
        pinchInProgress = false;
        op.log('Final Pinch detected, resetting');
        tmpScale = initialScale;
    } else {
        scalePort.set(checkAndCorrectBoundaries(scale * tmpScale));
    }




	//if(ev.additionalEvent) {
	    /*
	    if(ev.additionalEvent === 'pinchin') {
	        scale -=  Math.abs(ev.velocity);
	    } else if (ev.additionalEvent === 'pinchout') {
	        scale += Math.abs(ev.velocity);
	    }
	    */
	//}
	//scale += ev.velocity;
	/*
	op.log('ev.scale: ', ev.scale);
	tmpScale = ev.scale;

	var scaleToSet;
	if(ev.isFinal) {
	    scale *= tmpScale;
	    scaleToSet = scale;
	    tmpScale = initialScale;
	} else {
	    scaleToSet = scale * tmpScale;
	}

	op.log('scaleToSet', scaleToSet);

	scale = checkAndCorrectBoundaries(scale);
	scaleToSet = checkAndCorrectBoundaries(scaleToSet);

	scalePort.set(scaleToSet);
	*/
});

el.addEventListener('touchend', function(ev) {
    op.log('touchend');
    if(pinchInProgress) {
        op.log('touchend, setting manually');
        ev.preventDefault(); // this is ignored in some browsers
        ev.stopPropagation();
        pinchInProgress = false;
        scale *= tmpScale;
        scale = checkAndCorrectBoundaries(scale);
        tmpScale = initialScale;
        scalePort.set(scale);
    }
});

function checkAndCorrectBoundaries(s) {
    var correctedS = s;
    if(s < minScalePort.get()) {
	    correctedS = minScalePort.get();
	} else if(s > maxScalePort.get()) {
	    correctedS = maxScalePort.get();
	}
	return correctedS;
}

resetScalePort.onTriggered = reset;

// functions

function reset() {
    scale = initialScale;
    scalePort.set(scale);
}
