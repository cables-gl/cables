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

this.normalize=this.addInPort(new Port(this,"normalize",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.normalize.set(true);

var outNote=this.addOutPort(new Port(this,"note"));

cgl.frameStore.midi=cgl.frameStore.midi || {};
cgl.frameStore.midi.notes=cgl.frameStore.midi.notes || [];


var midi;

if (navigator.requestMIDIAccess)
{
    navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
}
else
{
    self.uiAttr({warning:"No MIDI support in your browser."});
}

function onMIDIFailure()
{
    console.log("no midi...");
}

var outputId=0;

function getDeviceString(input)
{
    return ""+input.value.type+": "+input.value.name+"("+input.value.version+") "+ 
            // "<br/>by: " + (input.value.manufacturer || 'unknown')+
            "<br/><br/>";

}

// midi functions
function onMIDISuccess(midiAccess)
{
    midi = midiAccess;
    var inputs = midi.inputs.values();
    var outputs = midi.outputs.values();
    var str='';
    self.uiAttr({'info':'no midi devices found'});
    // loop through all inputs
    for (var input = inputs.next(); input && !input.done; input = inputs.next())
    {
        // listen for midi messages
        input.value.onmidimessage = onMIDIMessage;
        // this just lists our inputs in the console
        str+=getDeviceString(input);

        // listInputs(input);
    }

    for (var output = outputs.next(); output && !output.done; output = outputs.next())
    {
        console.log(output);
        if(outputId===0) outputId=output.value.id;
        cgl.frameStore.midi.out=midi.outputs.get(outputId);;

        str+=getDeviceString(output);

        // console.log(output);
        // listInputs(output);
    }

    self.uiAttr({'info':str});

    // output = outputs.next();




    // listen for connect/disconnect message
    // midi.onstatechange = onStateChange;
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

    // var noteOnMessage = [0x90, note, 127];    // note on, middle C, full velocity

    outNote.set(note);

    var v=velocity;
    if(self.normalize.get())v/=127;
    cgl.frameStore.midi.notes[note]={v:v,n:note};
    cgl.frameStore.lastMidiNote=note;

}
