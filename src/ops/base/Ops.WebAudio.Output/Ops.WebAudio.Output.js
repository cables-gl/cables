op.name='audioOutput';

var audioContext = CABLES.WebAudio.createAudioContext(op);

var audioNode = audioContext.destination

var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", audioNode);

