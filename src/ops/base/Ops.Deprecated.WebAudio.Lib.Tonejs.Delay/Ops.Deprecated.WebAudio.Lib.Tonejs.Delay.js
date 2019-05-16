CABLES.WEBAUDIO.createAudioContext(op);

// default values
var DELAY_TIME_DEFAULT = 0.11;
var DELAY_TIME_MIN = 0;
var DELAY_TIME_MAX = 1; 
var MAX_DELAY_TIME_DEFAULT = 179;
var MAX_DELAY_TIME_MIN = 1;
var MAX_DELAY_TIME_MAX = 179;

// vars
var node = new Tone.Delay(DELAY_TIME_DEFAULT, MAX_DELAY_TIME_DEFAULT);

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var delayTimePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Delay Time", node.delayTime, {"display": "range", "min": DELAY_TIME_MIN, "max": DELAY_TIME_MAX}, DELAY_TIME_DEFAULT);
var maxDelayTimePort = op.inValueString("Max Delay Time", MAX_DELAY_TIME_DEFAULT);
maxDelayTimePort.onChange = handleChange;


// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// functions
function handleChange() {
    var maxDelayTime = maxDelayTimePort.get();
    
    if(!maxDelayTime || maxDelayTime < MAX_DELAY_TIME_MIN || maxDelayTime > MAX_DELAY_TIME_MAX) {
        op.log("Warning: Max Delay Time should be between 1 and 179!");
        return;
    }
    
    // check if maxDelayTime is valid and set it if so
    try{
	    var time = new Tone.TimeBase(maxDelayTime);	
	    node.set("maxDelay", maxDelayTime);
	    
    } catch(e) {
        // not valid
        op.uiAttr( { 'error': 'maxDelayTime not valid, Examples: "4n", "1m", 2' } );
        if(window && window.gui && gui.patch) gui.patch().showOpParams(op); // update GUI
    	return;
    }
    // reset UI warning
    op.uiAttr( { 'error': null } );
    if(window && window.gui && gui.patch) gui.patch().showOpParams(op); // update GUI
    
}

handleChange();
