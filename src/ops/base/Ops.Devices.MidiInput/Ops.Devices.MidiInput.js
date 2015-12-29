//
// midi api 
//
// http://www.keithmcmillen.com/blog/making-music-in-the-browser-web-midi-api/
//
// todo: show warning when no midi support
// todo: show (select?) midi devices

Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;
this.name='midiInput';

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.normalize=this.addInPort(new Port(this,"normalize",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.normalize.set(true);

this.note=this.addOutPort(new Port(this,"note"));
this.noteValue=this.addOutPort(new Port(this,"note value"));

var midi;

if (navigator.requestMIDIAccess)
{
    navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
}
else
{
    alert("No MIDI support in your browser.");
}
function onMIDIFailure()
{
    console.log("no midi...");
}

// midi functions
function onMIDISuccess(midiAccess)
{
    midi = midiAccess;
    var inputs = midi.inputs.values();
    // loop through all inputs
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // listen for midi messages
        input.value.onmidimessage = onMIDIMessage;
        // this just lists our inputs in the console
        listInputs(input);
    }
    // listen for connect/disconnect message
    midi.onstatechange = onStateChange;
}

function onMIDIMessage(event)
{
    var data = event.data;
    var cmd = data[0] >> 4;
    var channel = data[0] & 0xf;
    var type = data[0] & 0xf0; // channel agnostic message type. Thanks, Phil Burk.
    var note = data[1];
    var velocity = data[2];
    // with pressure and tilt off
    // note off: 128, cmd: 8 
    // note on: 144, cmd: 9
    // pressure / tilt on
    // pressure: 176, cmd 11: 
    // bend: 224, cmd: 14

    // switch (type) {
    //     case 144: // noteOn message 
    //          noteOn(note, velocity);
    //          break;
    //     case 128: // noteOff message 
    //         noteOff(note, velocity);
    //         break;
    // }

    // console.log('cmd', cmd,'channel', channel,'type', type, 'note',note,'velocity',velocity);

    self.note.set(note);
    self.noteValue.set(velocity);
    cgl.frameStore.midi=cgl.frameStore.midi || [];
    var v=velocity;
    if(self.normalize.get())v/=127;
    cgl.frameStore.midi[note]={v:v,n:note};

    self.trigger.trigger();
}


function listInputs(inputs) {
    var input = inputs.value;
    console.log("Input port : [ type:'" + input.type + "' id: '" + input.id +
        "' manufacturer: '" + input.manufacturer + "' name: '" + input.name +
        "' version: '" + input.version + "']");
}
