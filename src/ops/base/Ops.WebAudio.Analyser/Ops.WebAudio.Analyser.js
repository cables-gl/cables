    var self=this;
    Op.apply(this, arguments);

    if(!window.audioContext) {
         audioContext = new AudioContext();
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

    this.refresh.onTriggered = function()
    {
        var array =  new Uint8Array(self.analyser.frequencyBinCount);
        self.analyser.getByteFrequencyData(array);
        
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
        console.log(self.audioIn.val);
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