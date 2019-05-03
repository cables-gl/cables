var microphone = null;
var audioCtx=CABLES.WEBAUDIO.createAudioContext(op);

const inInit=op.inTriggerButton("Start");
const audioOut=op.outObject("audio out");
const recording=op.outValueBool("Listening",false);

function streamAudio(stream)
{
    microphone = audioCtx.createMediaStreamSource(stream);
    audioOut.set( microphone );
    console.log("[microphoneIn] streaming mic audio!",stream,microphone);
    recording.set(true);
}

inInit.onTriggered=function()
{
    if(!audioCtx)
    {
        console.log("[microphoneIn] no audiocontext!");
        return;
    }

    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    {
        console.log("[microphoneIn] new micro");

        navigator.mediaDevices.getUserMedia({audio:true})
            .then(function (stream)
            {
                microphone = audioCtx.createMediaStreamSource(stream);
                audioOut.set( microphone );
                console.log("streaming mic audio!",stream,microphone);
                recording.set(true);
            })
            .catch(function(err) {
                console.log("[microphoneIn] could not get usermedia promise",err);
                recording.set(false);
            });
    }
    else
    {
        // old method
        navigator.getUserMedia = (navigator.getUserMedia ||  navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia);

        if (navigator.getUserMedia)
        {
            navigator.getUserMedia(
                {audio:true},
                streamAudio,
                function(e){console.log('[microphoneIn]No live audio input ' + e);
                recording.set(false);}
            );
        }
        else
        {
            console.log("[op microphone] could not get usermedia");
            recording.set(false);
        }
    }

};



