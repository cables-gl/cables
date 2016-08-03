    var self=this;
    Op.apply(this, arguments);

    window.AudioContext = window.AudioContext||window.webkitAudioContext;

    if(!window.audioContext) {
        window.audioContext = new AudioContext();
    }

    this.name='Audio Analyser';
    this.audioIn=this.addInPort(new Port(this,"audio in",OP_PORT_TYPE_OBJECT));
    this.refresh=this.addInPort(new Port(this,"refresh",OP_PORT_TYPE_FUNCTION));

    this.audioOut=this.addOutPort(new Port(this, "audio out",OP_PORT_TYPE_OBJECT));
    this.avgVolume=this.addOutPort(new Port(this, "average volume",OP_PORT_TYPE_VALUE));
    this.fftOut=this.addOutPort(new Port(this, "fft",OP_PORT_TYPE_ARRAY));

    this.oldAudioIn=null;

    this.analyser = audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.3;
    this.analyser.fftSize = 256;
    var fftBufferLength=0;
    var fftDataArray =null;

// inMaxDecibel.onValueChanged=updateDecibel;
// inMinDecibel.onValueChanged=updateDecibel;

// function updateDecibel()
// {
    
//     var min=inMinDecibel.get();
//     var max=inMaxDecibel.get();
    
//     if(min>=max)min=max-1;
//     if(max<=min)max=min+1;
    
//     if(min<-171)min=-171;
//     if(max<=-110)max=-109;
    
//     self.analyser.minDecibels = min;
//     self.analyser.maxDecibels = max;
    
    
    
//     console.log('set decibel ',min,max);
// }
    
        


    this.refresh.onTriggered = function()
    {
        // console.log(self.analyser.frequencyBinCount);
        var array =  new Uint8Array(self.analyser.frequencyBinCount);
        
        // array.length/=Math.round(audioContext.sampleRate/44100;
        if(!array)return;
        self.analyser.getByteFrequencyData(array);
    self.analyser.minDecibels = -110;
    self.analyser.maxDecibels = -10;

        
        if(!fftDataArray)return;
        var values = 0;
        var average;

        for (var i = 0; i < array.length; i++)
        {
            values += array[i];
        }
 
        average = values / array.length;
        
        self.avgVolume.val=average;

        self.analyser.getByteFrequencyData(fftDataArray);
        self.fftOut.val=fftDataArray;
    };

    this.audioIn.onValueChanged = function()
    {
        // console.log(self.audioIn.val);
        if (self.audioIn.val === null) {
            if (self.oldAudioIn !== null) {
                self.oldAudioIn.disconnect(self.analyser);
            }
        } else {
            self.audioIn.val.connect(self.analyser);
        }
        self.oldAudioIn=self.audioIn.val;

        fftBufferLength = self.analyser.frequencyBinCount;
        fftDataArray = new Uint8Array(fftBufferLength);
    };

    this.audioOut.val = this.analyser;