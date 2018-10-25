this.name="Ops.WebAudio.KeyPiano";

var op = this;

var c_on = this.addInPort( new CABLES.Port( this, "c note on", OP_PORT_TYPE_FUNCTION ));
var c_off = this.addInPort( new CABLES.Port( this, "c note off", OP_PORT_TYPE_FUNCTION ));
var cis_on = this.addInPort( new CABLES.Port( this, "cis note on", OP_PORT_TYPE_FUNCTION ));
var cis_off = this.addInPort( new CABLES.Port( this, "cis note off", OP_PORT_TYPE_FUNCTION ));
var d_on = this.addInPort( new CABLES.Port( this, "d note on", OP_PORT_TYPE_FUNCTION ));
var d_off = this.addInPort( new CABLES.Port( this, "d note off", OP_PORT_TYPE_FUNCTION ));
var dis_on = this.addInPort( new CABLES.Port( this, "dis note on", OP_PORT_TYPE_FUNCTION ));
var dis_off = this.addInPort( new CABLES.Port( this, "dis note off", OP_PORT_TYPE_FUNCTION ));
var e_on = this.addInPort( new CABLES.Port( this, "e note on", OP_PORT_TYPE_FUNCTION ));
var e_off = this.addInPort( new CABLES.Port( this, "e note off", OP_PORT_TYPE_FUNCTION ));
var f_on = this.addInPort( new CABLES.Port( this, "f note on", OP_PORT_TYPE_FUNCTION ));
var f_off = this.addInPort( new CABLES.Port( this, "f note off", OP_PORT_TYPE_FUNCTION ));
var fis_on = this.addInPort( new CABLES.Port( this, "fis note on", OP_PORT_TYPE_FUNCTION ));
var fis_off = this.addInPort( new CABLES.Port( this, "fis note off", OP_PORT_TYPE_FUNCTION ));
var g_on = this.addInPort( new CABLES.Port( this, "g note on", OP_PORT_TYPE_FUNCTION ));
var g_off = this.addInPort( new CABLES.Port( this, "g note off", OP_PORT_TYPE_FUNCTION ));
var gis_on = this.addInPort( new CABLES.Port( this, "gis note ons", OP_PORT_TYPE_FUNCTION ));
var gis_off = this.addInPort( new CABLES.Port( this, "gis note off", OP_PORT_TYPE_FUNCTION ));
var a_on = this.addInPort( new CABLES.Port( this, "a note on", OP_PORT_TYPE_FUNCTION ));
var a_off = this.addInPort( new CABLES.Port( this, "a note off", OP_PORT_TYPE_FUNCTION ));
var ais_on = this.addInPort( new CABLES.Port( this, "ais note on", OP_PORT_TYPE_FUNCTION ));
var ais_off = this.addInPort( new CABLES.Port( this, "ais note off", OP_PORT_TYPE_FUNCTION ));
var b_on = this.addInPort( new CABLES.Port( this, "b note on", OP_PORT_TYPE_FUNCTION ));
var b_off = this.addInPort( new CABLES.Port( this, "b note off", OP_PORT_TYPE_FUNCTION ));

var frequency = this.addOutPort( new CABLES.Port( this, "frequency", CABLES.OP_PORT_TYPE_VALUE ));
var isPressed = this.addOutPort( new CABLES.Port( this, "is pressed", CABLES.OP_PORT_TYPE_VALUE ));

var OCTAVE_MIN = 1;
var OCTAVE_MAX = 7;

var toneFreqMap = [];

for(var i = OCTAVE_MIN; i <= OCTAVE_MAX; i++){
    toneFreqMap[i] = {};
}

// octave 1
toneFreqMap[1]['c'] = 32.7032;
toneFreqMap[1]['cis'] = 34.6478;
toneFreqMap[1]['d'] = 36.7081;
toneFreqMap[1]['dis'] = 38.8909;
toneFreqMap[1]['e'] = 41.2034;
toneFreqMap[1]['f'] = 43.6535;
toneFreqMap[1]['fis'] = 46.2493;
toneFreqMap[1]['g'] = 48.9994;
toneFreqMap[1]['gis'] = 51.9131;
toneFreqMap[1]['a'] = 55.0000;
toneFreqMap[1]['ais'] = 58.2705;
toneFreqMap[1]['b'] = 61.7354;
// octave 2
toneFreqMap[2]['c'] = 65.4064;
toneFreqMap[2]['cis'] = 69.2957;
toneFreqMap[2]['d'] = 73.4162;
toneFreqMap[2]['dis'] = 77.7817;
toneFreqMap[2]['e'] = 82.4069;
toneFreqMap[2]['f'] = 87.3071;
toneFreqMap[2]['fis'] = 92.4986;
toneFreqMap[2]['g'] = 97.9989;
toneFreqMap[2]['gis'] = 103.826;
toneFreqMap[2]['a'] = 110.000;
toneFreqMap[2]['ais'] = 116.541;
toneFreqMap[2]['b'] = 123.471;
// octave 3
toneFreqMap[3]['c'] = 130.813;
toneFreqMap[3]['cis'] = 138.591;
toneFreqMap[3]['d'] = 146.832;
toneFreqMap[3]['dis'] = 155.563;
toneFreqMap[3]['e'] = 164.814;
toneFreqMap[3]['f'] = 174.614;
toneFreqMap[3]['fis'] = 184.997;
toneFreqMap[3]['g'] = 195.998;
toneFreqMap[3]['gis'] = 207.652;
toneFreqMap[3]['a'] = 220.000;
toneFreqMap[3]['ais'] = 233.082;
toneFreqMap[3]['b'] = 246.942;
// octave 4
toneFreqMap[4]['c'] = 261.626;
toneFreqMap[4]['cis'] = 277.183;
toneFreqMap[4]['d'] = 293.665;
toneFreqMap[4]['dis'] = 311.127;
toneFreqMap[4]['e'] = 329.628;
toneFreqMap[4]['f'] = 349.228;
toneFreqMap[4]['fis'] = 369.994;
toneFreqMap[4]['g'] = 391.995;
toneFreqMap[4]['gis'] = 415.305;
toneFreqMap[4]['a'] = 440.000;
toneFreqMap[4]['ais'] = 466.164;
toneFreqMap[4]['b'] = 493.883;
// octave 5
toneFreqMap[5]['c'] = 523.251;
toneFreqMap[5]['cis'] = 554.365;
toneFreqMap[5]['d'] = 587.330;
toneFreqMap[5]['dis'] = 622.254;
toneFreqMap[5]['e'] = 659.255;
toneFreqMap[5]['f'] = 698.456;
toneFreqMap[5]['fis'] = 739.989;
toneFreqMap[5]['g'] = 783.991;
toneFreqMap[5]['gis'] = 830.609;
toneFreqMap[5]['a'] = 880.000;
toneFreqMap[5]['ais'] = 932.328;
toneFreqMap[5]['b'] = 987.767;
// octave 6
toneFreqMap[6]['c'] = 1046.50;
toneFreqMap[6]['cis'] = 1108.73;
toneFreqMap[6]['d'] = 1174.66;
toneFreqMap[6]['dis'] = 1244.51;
toneFreqMap[6]['e'] = 1318.51;
toneFreqMap[6]['f'] = 1396.91;
toneFreqMap[6]['fis'] = 1479.98;
toneFreqMap[6]['g'] = 1567.98;
toneFreqMap[6]['gis'] = 1661.22;
toneFreqMap[6]['a'] = 1760.00;
toneFreqMap[6]['ais'] = 1864.66;
toneFreqMap[6]['b'] = 1975.53;
// octave 7
toneFreqMap[7]['c'] = 2093.00;
toneFreqMap[7]['cis'] = 2217.46;
toneFreqMap[7]['d'] = 2349.32;
toneFreqMap[7]['dis'] = 2489.02;
toneFreqMap[7]['e'] = 2637.02;
toneFreqMap[7]['f'] = 2793.83;
toneFreqMap[7]['fis'] = 2959.96;
toneFreqMap[7]['g'] = 3135.96;
toneFreqMap[7]['gis'] = 3322.44;
toneFreqMap[7]['a'] = 3520.00;
toneFreqMap[7]['ais'] = 3729.31;
toneFreqMap[7]['b'] = 3951.07;

function octaveInRange(oct) {
    return oct >= OCTAVE_MIN && oct <= OCTAVE_MAX;
}

function handleNoteOn(tone) {
    var oct = parseInt(octave.get());
    if(octaveInRange(oct)) {
        var freq = (toneFreqMap[oct][tone]);
        frequency.set(freq);
        isPressed.set(1.0);
        op.log("[note on] " + tone + oct + " (" + freq + "Hz)");
    }
}

c_on.onTriggered = function(){ handleNoteOn('c'); };
cis_on.onTriggered = function(){ handleNoteOn('cis'); };
d_on.onTriggered = function(){ handleNoteOn('d'); };
dis_on.onTriggered = function(){ handleNoteOn('dis'); };
e_on.onTriggered = function(){ handleNoteOn('e'); };
f_on.onTriggered = function(){ handleNoteOn('f'); };
fis_on.onTriggered = function(){ handleNoteOn('fis'); };
g_on.onTriggered = function(){ handleNoteOn('g'); };
gis_on.onTriggered = function(){ handleNoteOn('gis'); };
a_on.onTriggered = function(){ handleNoteOn('a'); };
ais_on.onTriggered = function(){ handleNoteOn('ais'); };
b_on.onTriggered = function(){ handleNoteOn('b'); };

function handleNoteOff(tone) {
    var oct = parseInt(octave.get());
    if(octaveInRange(oct)) {
        var freq = (toneFreqMap[oct][tone]);
        frequency.set(freq);
        isPressed.set(0.0);
        op.log("[note on] " + tone + oct + " (" + freq + "Hz)");
    }
}

c_off.onTriggered = function(){ handleNoteOff('c'); };
cis_off.onTriggered = function(){ handleNoteOff('cis'); };
d_off.onTriggered = function(){ handleNoteOff('d'); };
dis_off.onTriggered = function(){ handleNoteOff('dis'); };
e_off.onTriggered = function(){ handleNoteOff('e'); };
f_off.onTriggered = function(){ handleNoteOff('f'); };
fis_off.onTriggered = function(){ handleNoteOff('fis'); };
g_off.onTriggered = function(){ handleNoteOff('g'); };
gis_off.onTriggered = function(){ handleNoteOff('gis'); };
a_off.onTriggered = function(){ handleNoteOff('a'); };
ais_off.onTriggered = function(){ handleNoteOff('ais'); };
b_off.onTriggered = function(){ handleNoteOff('b'); };

var octave = this.addInPort( new CABLES.Port( this, "octave", CABLES.OP_PORT_TYPE_));

octave.set(4);
frequency.set(0);
