
op.name='MidiDeviceList';

var outNumDevices=op.addOutPort(new CABLES.Port(op,"Num Devices"));
var outSupport=op.addOutPort(new CABLES.Port(op,"Midi Support"));
var outNames=op.addOutPort(new CABLES.Port(op,"Device Names",CABLES.OP_PORT_TYPE_ARRAY));

var midi=null;

function onMIDIFailure()
{
    outSupport.set(false);
}

if (navigator.requestMIDIAccess) navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
    else onMIDIFailure();


function onMIDISuccess(midiAccess)
{
    var arr=[];
    midi = midiAccess;
    outSupport.set(true);
    var inputs = midi.inputs.values();

    var devices=[];
    var numDevices=0;
    
    for (var input = inputs.next(); input && !input.done; input = inputs.next())
    {
        arr.push(input.value.name);
        numDevices++;
    }

    outNames.set(arr);
    outNumDevices.set(numDevices);
}


