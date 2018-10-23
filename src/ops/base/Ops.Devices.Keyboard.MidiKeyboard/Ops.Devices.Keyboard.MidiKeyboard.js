 op.name="MidiKeyboard";

var canvasOnly=op.addInPort(new Port(op,"canvas only",CABLES.OP_PORT_TYPE_VALUE, {"display": "bool"}));

var noteNumberPort = op.outValue("Note Number");
var velocityPort = op.outValue("Velocity");
var channelPort = op.outValue("Channel");
var commandPort = op.outValue("Command");

var cgl=op.patch.cgl;

function midiMessageReceived (msgs) {
  for (var i=0; i < msgs.length; i++) {
    var cmd = msgs[i].data[0] >> 4;
    var channel = msgs[i].data[0] & 0xf;
    var noteNumber = msgs[i].data[1];
    var velocity = msgs[i].data[2];
    
    noteNumberPort.set(noteNumber);
    velocityPort.set(velocity);
    channelPort.set(channel);
    commandPort.set(cmd);

    /*
    if (cmd==8) {
      //myNode.noteOff(0);
    } else if (cmd == 9) {
      //myNode.noteOn(0);
    }
    */
  }
}

/*
 * Midikeys.js
 * > Turn your keyboard into a midi keyboard, compatible with the Web MIDI API.
 * Copyright 2012 Nick Thompson
 * MIT License
 * https://gist.github.com/3995530
 */

  // Keycode to MIDI note values
  var map = {};

  map[81]  = 72; // q C5
  map[87]  = 74; // w D5
  map[69]  = 76; // e E5
  map[82]  = 77; // r F5
  map[84]  = 79; // t G5
  map[89]  = 81; // y A5
  map[85]  = 83; // u B5
  map[73]  = 84; // i C6
  map[79]  = 86; // o D6
  map[80]  = 88; // p E6
  map[219] = 89; // [ F6
  map[221] = 91; // ] G6

  map[83]  = 61; // s C#4
  map[68]  = 63; // d D#4
  map[71]  = 66; // g F#4
  map[72]  = 68; // h G#4
  map[74]  = 70; // j A#4
  map[76]  = 73; // l C#5
  map[186] = 75; // ; D#5

  map[90]  = 60; // z C4
  map[88]  = 62; // x D4
  map[67]  = 64; // c E4
  map[86]  = 65; // v F4
  map[66]  = 67; // b G4
  map[78]  = 69; // n A4
  map[77]  = 71; // m B4
  map[188] = 72; // , C5
  map[190] = 74; // . D5
  map[191] = 76; // / E5

  // Keep track of keydown and keyup events so that the keydown event doesn't
  // send messages repeatedly until keyup.
  var flags = {};

  function sendMessage (e, command) {
    // Check the event key against the midi map.
    var note = map[ (typeof e.which === "number")? e.which : e.keyCode ];

    // If the key doesn't exist in the midi map, or we're trying to send a
    // noteOn event without having most recently sent a noteOff, end here.
    if (note === undefined || (flags[note] && command === 0x9)) {
      return false;
    }

    // Build the data
    var data = new Uint8Array(3);

    data[0] = (command << 4) + 0x00;  // Send the command on channel 0
    data[1] = note;                   // Attach the midi note
    data[2] = 127;                    // Keyboard keys default to 127 velocity.

    // Package the message
    var msg = {
      data: data,
      timestamp: 0
    };

    // Send it
    api.onmessage.call(window, [msg]);

    // Update the flag table
    if (command === 0x9) {
      flags[note] = true;
    } else {
      flags[note] = false;
    }
  }

  // MIDIKeys api object, to be exposed as window.Keys
  var api = {

    // Expose the onmessage parameter like on a MIDIInput object
    onmessage: null

  };

  var MIDIKeys = api;

  // Including Midikeys.js in your project file packages fake MIDI messages the same as a normal message,
// so you can then just attach your message handler to MIDI keys and you're done

MIDIKeys.onmessage = midiMessageReceived;

function onKeyDown(e) {
    sendMessage(e, 0x09);
}

function onKeyUp(e) {
    sendMessage(e, 0x08);
}

function addListener() {
    if(canvasOnly.get() === true) {
        addCanvasListener();
    } else {
        addDocumentListener();
    }
}

function removeListeners() {
    document.removeEventListener("keydown", onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    cgl.canvas.removeEventListener('keydown', onKeyDown, false);
    cgl.canvas.removeEventListener('keyup', onKeyUp, false);
}

function addCanvasListener() {
    cgl.canvas.addEventListener("keydown", onKeyDown, false );
    cgl.canvas.addEventListener("keyup", onKeyUp, false );
}

function addDocumentListener() {
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
}

canvasOnly.onValueChange(function(){
    removeListeners();
    addListener();
});

canvasOnly.set(true);
addCanvasListener();
