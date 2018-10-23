this.name='Oscillator';

CABLES.WEBAUDIO.createAudioContext(op);

//inputs
var type=this.addInPort(new Port(this,"type",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:[ 'sine','square','sawtooth','triangle' ]}));
var frequency=this.addInPort(new Port(this,"frequency",CABLES.OP_PORT_TYPE_VALUE));

//outputs
var audioOut=this.addOutPort(new Port(this, "audio out",CABLES.OP_PORT_TYPE_OBJECT));

//initialisation
var oscillator = audioContext.createOscillator();

audioOut.set(oscillator );
oscillator.start(0);


//defaults
type.set('sawtooth');
frequency.set(200);


//valueChanges
var updateFrequency = function ()
{
    oscillator.frequency.value=frequency.get();
};
frequency.onValueChange(updateFrequency);

var updateType = function ()
{
    oscillator.type=type.get();
};
type.onValueChange(updateType);



