op.name='MidiKeyPressed';

// input ports
var eventIn = op.inObject("Event Input");

// output ports
var eventOut = op.outObject("Event Output");
var outPressed = op.outFunction("Key Pressed");
var outReleased = op.outFunction("Key Released");

var outNote = op.outValue("Note");
var outVelocity = op.outValue("Velocity");
var outChannel = op.outValue("Channel");
var outDevice = op.outValue("Device");

var CMD_NOTE_ON = 9;
var CMD_NOTE_OFF = 8;

eventIn.onValueChanged=function() {
  var event=eventIn.get();
  if(event && event.cmd == 9 || event.cmd == 8) {
    outDevice.set(event.deviceName);
    outNote.set(event.note);
    outChannel.set(event.channel);
    outVelocity.set(event.velocity);
    eventOut.set(event);
    if(event.cmd == 9) {
      outPressed.trigger();
    } else if(event.cmd == 8) {
      outReleased.trigger();
    }
  }
};
