this.name='Oscillator';

if(!window.audioContext){ audioContext = new AudioContext(); }


var frequencyAudioRate=this.addInPort(new Port(this,"audio in",OP_PORT_TYPE_OBJECT));
var type=this.addInPort(new Port(this,"type",OP_PORT_TYPE_VALUE,{display:'dropdown',values:[ 'sine','square','sawtooth','triangle' ]}));


var oscillator = audioContext.createOscillator();
oscillator.start(0);

oscillator.frequency.value = 200;

function updateFrequency()
{
    oscillator.frequency.value=frequency.get();
}

function updateType()
{
    oscillator.type=type.get();
}

var oldfrequencyAudioRate = null;

frequencyAudioRate.onValueChanged = function()
{
    if (!frequencyAudioRate.get()) {
        if (oldfrequencyAudioRate !== null) {
            try{
                oldfrequencyAudioRate.disconnect(oscillator);
            } catch(e) {
                console.log(e);
            }
        }
    } else {
        frequencyAudioRate.val.connect(oscillator);
    }  
    oldfrequencyAudioRate=frequencyAudioRate.val;
};

type.set('sawtooth');
type.onValueChange(updateType);

var frequency=this.addInPort(new Port(this,"frequency",OP_PORT_TYPE_VALUE));
frequency.onValueChange(updateFrequency);

var audioOut=this.addOutPort(new Port(this, "audio out",OP_PORT_TYPE_OBJECT));
audioOut.set( oscillator );

frequency.set(200);
