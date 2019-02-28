CABLES.WEBAUDIO.createAudioContext = function(op) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if(!AudioContext) return;
    if(!window.audioContext)
        window.audioContext = new AudioContext({sampleRate:44100});
    // check if tone.js lib is being used
    if(window.Tone && !CABLES.WEBAUDIO.toneJsInitialized) {
      // set current audio context in tone.js
      Tone.setContext(window.audioContext);
      CABLES.WEBAUDIO.toneJsInitialized = true;
    }
    return window.audioContext;
};


const context = CABLES.WEBAUDIO.createAudioContext(op);
context.addEventListener('statechange', onContextStateChange);
const canvasWrapper = op.patch.cgl.canvas.parentElement;
const showOverlayPort = op.inValueBool('Show Overlay', true);
let overlay = null;
let button = null;

// inputs
const inTrigger = op.inTriggerButton('Resume');

// outputs
const currentStatePort = op.outValueString('Current State');
currentStatePort.set(context.state);

inTrigger.onTriggered = checkState;
showOverlayPort.onChange = onShowOverlayPortChange;

if(showOverlayPort.get()) {
    checkOverlay();
}

function onShowOverlayPortChange() {
    if(showOverlayPort.get()) {
        checkOverlay();
    } else {
        removeOverlay();
    }
}

function checkState() {
    if(context.state !== 'running') {
        context.resume();
    }
    if(showOverlayPort.get()) {
        checkOverlay();
    }
}

function removeOverlay() {
    if(overlay) {
        overlay.parentNode.removeChild(overlay);
    }
    if(button) {
        button.parentNode.removeChild(button);
        button.removeEventListener('click', onButtonClick);
    }
    overlay = null;
    button = null;
}

function checkOverlay() {
    if(context.state !== 'running') {
        initElements();
    } else { /* context is running */
        removeOverlay();
    }
}

function onButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();
    checkState();
}

function onContextStateChange(event) {
    currentStatePort.set(event.target.state);
    // console.log('Web Audio State changed to: ', event.target.state);
    checkOverlay();
}

function initElements() {
    if(!overlay) {
        overlay = document.createElement('div');
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = '100000000';
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'white';
            overlay.style.opacity = '0.7';
        canvasWrapper.appendChild(overlay);
    }
    if(!button) {
        button = document.createElement('div');
            button.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMyNGJhYTciIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLXBsYXktY2lyY2xlIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBvbHlnb24gcG9pbnRzPSIxMCA4IDE2IDEyIDEwIDE2IDEwIDgiPjwvcG9seWdvbj48L3N2Zz4=)';
            button.style.width = '20vh';
            button.style.height = '20vh';
            button.style.cursor = 'pointer';
            button.style.backgroundSize = 'cover';
        button.addEventListener('click', onButtonClick);
        overlay.appendChild(button);
    }
}

op.onDelete = removeOverlay;