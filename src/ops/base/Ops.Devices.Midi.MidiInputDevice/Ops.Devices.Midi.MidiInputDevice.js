
// http://www.keithmcmillen.com/blog/making-music-in-the-browser-web-midi-api/

//https://ccrma.stanford.edu/~craig/articles/linuxmidi/misc/essenmidi.html

op.name='midiInput';
op.requirements=[CABLES.Requirements.MIDI];


var normalize=op.addInPort(new Port(op,"normalize",OP_PORT_TYPE_VALUE,{display:'bool'}));
var deviceSelect=op.addInPort(new Port(op,"device",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["none"]} ));

var resetLights=op.addInPort(new Port(op,"Reset Lights",OP_PORT_TYPE_VALUE,{display:'bool'} ));

var outEvent=op.addOutPort(new Port(op,"Event",OP_PORT_TYPE_OBJECT));

resetLights.set(false);
normalize.set(true);

var midi=null;
var outputDevice=null;
var inputDevice=null;

deviceSelect.onValueChanged=setDevice;

if (navigator.requestMIDIAccess) navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
    else onMIDIFailure();


resetLights.onValueChanged=doResetLights;
function doResetLights()
{
    if(outputDevice && resetLights.get())
    {
        for(var i=0;i<128;i++)
        {
            outputDevice.send( [0x90, i, 0] );
            outputDevice.send( [0xb0, i, 0] );
        }
    }
}

function setDevice()
{
    if(!midi || !midi.inputs)return;
    var name=deviceSelect.get();
    
    op.name="Midi "+name;
    
    var inputs = midi.inputs.values();
    var outputs = midi.outputs.values();

    for (var input = inputs.next(); input && !input.done; input = inputs.next())
    {
        if(input.value.name==name)
            input.value.onmidimessage = onMIDIMessage;
        else
            if(input.value.onmidimessage == onMIDIMessage)
                input.value.onmidimessage=null;
    }

    for (var output = outputs.next(); output && !output.done; output = outputs.next())
        if(output.value.name==name)
            outputDevice=midi.outputs.get(output.value.id);
            
    doResetLights();
}

function onMIDIFailure()
{
    op.uiAttr({warning:"No MIDI support in your browser."});
}

function onMIDISuccess(midiAccess)
{
    midi = midiAccess;
    var inputs = midi.inputs.values();
    op.uiAttr({'info':'no midi devices found'});

    var deviceNames=[];
    
    for (var input = inputs.next(); input && !input.done; input = inputs.next())
        deviceNames.push(input.value.name);

    deviceSelect.uiAttribs.values=deviceNames;

    if(CABLES.UI)gui.patch().showOpParams(op);
    setDevice();
}

function onMIDIMessage(_event)
{
    var data = _event.data;
    var event=
        {
            "deviceName":deviceSelect.get(),
            "output":outputDevice,
            "inputId":0,
            "cmd":data[0] >> 4,
            "channel":data[0] & 0xf,
            "type":data[0] & 0xf0,
            "note":data[1],
            "velocity": data[2],
            "data":data
        };

    if(normalize.get())event.velocity/=127;

    // with pressure and tilt off
    // note off: 128, cmd: 8 
    // note on: 144, cmd: 9
    // pressure / tilt on
    // pressure: 176, cmd 11: 
    // bend: 224, cmd: 14

    outEvent.set(event);
}
