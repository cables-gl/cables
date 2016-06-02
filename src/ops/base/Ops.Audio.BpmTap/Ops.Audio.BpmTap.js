this.name="Ops.Audio.BPMTap";

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var tap=this.addInPort(new Port(this,"tap",OP_PORT_TYPE_FUNCTION,{"display":"button"}));
var sync=this.addInPort(new Port(this,"sync",OP_PORT_TYPE_FUNCTION,{"display":"button"}));
var nudgeLeft=this.addInPort(new Port(this,"nudgeLeft",OP_PORT_TYPE_FUNCTION,{"display":"button"}));
var nudgeRight=this.addInPort(new Port(this,"nudgeRight",OP_PORT_TYPE_FUNCTION,{"display":"button"}));

var beat=this.addOutPort(new Port(this,"beat",OP_PORT_TYPE_FUNCTION));
var bpm=this.addOutPort(new Port(this,"Bpm",OP_PORT_TYPE_VALUE,{display:'editor'}));
var outStates=this.addOutPort(new Port(this,"States",OP_PORT_TYPE_ARRAY));

var DEFAULT_BPM = 127;
var DEFAULT_MILLIS = bpmToMillis(DEFAULT_BPM);
var NUDGE_VALUE = 0.5; // to add / substract from avg bpm

var lastFlash = -1;
var lastTap = -1;

var taps=[];

var avgBpm = DEFAULT_BPM;
var avgMillis = getAvgMillis();

var beatCounter = 1; // [1, 2, 3, 4]
var states=[1,0,0,0];

exe.onTriggered=function() {
    if(Date.now() > lastFlash + avgMillis){
        beat.trigger();
        incrementState();
        outStates.set(null);
        outStates.set(states);
        
        bpm.set(millisToBpm(avgMillis)); 
        lastFlash = Date.now();
        //console.log("Date.now: " + Date.now());
    }
}

function incrementState(){
    beatCounter++;
    if(beatCounter > 4){
        beatCounter = 1;
    }
    for(var i=0;i<4;i++){
        states[i]=0;
    }
    states[beatCounter-1] = 1;

    
}

function tapPressed() {
    // start new tap session
    if(Date.now() - lastTap > 1000) {
        taps.length=0;
        beatCounter = 0;
    }
    else {
        taps.push(Date.now() - lastTap);
    }
    lastTap = Date.now();
    avgMillis = getAvgMillis();
}

function millisToBpm(millis){
    return Number(60*1000/millis).toFixed(2);    
}

function bpmToMillis(bpm){
    return 60*1000/bpm;    
}

function getAvgMillis() {
    if(taps.length >= 1) {
        var sum = 0.0;
        for(var i=0; i<taps.length; i++) {
            sum += taps[i];
        }
        return sum/taps.length;
    }
    else {
        return DEFAULT_MILLIS;
    }
}

function syncPressed(){
    // on next execute everything will be reset to first beat
    lastFlash = -1;
    beatCounter = 0;
}

function nudgeLeftPressed() {
    avgBpm += NUDGE_VALUE;
    avgMillis = bpmToMillis(avgBpm);
}

function nudgeRightPressed() {
    avgBpm -= NUDGE_VALUE;
    avgMillis = bpmToMillis(avgBpm);
}

tap.onTriggered = tapPressed;
sync.onTriggered = syncPressed;
nudgeLeft.onTriggered = nudgeLeftPressed;
nudgeRight.onTriggered = nudgeRightPressed;
