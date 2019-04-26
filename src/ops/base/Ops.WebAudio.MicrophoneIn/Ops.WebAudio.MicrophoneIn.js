var microphone = null;
// var audioContext=null;
var audioCtx = null;

const inInit=op.inTrigger("Start");
const audioOut=op.outObject("audio out");

function streamAudio(stream)
{
    microphone = audioCtx.createMediaStreamSource(stream);
    audioOut.set( microphone );
    console.log("streaming mic audio!",stream,microphone);
}



inInit.onTriggered=function()
{
    if(audioCtx)return;
    audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

    // if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    // {
    //     // new method - does not work, i don't know why

    //     console.log("new micro");

    //     navigator.mediaDevices.getUserMedia({audio:true})
    //     .then(streamAudio)
    //     .catch(function(err) {
    //       console.log("[op microphone] could not get usermedia promise");
    //     });

    // }
    // else
    {
        // old method
        navigator.getUserMedia = (navigator.getUserMedia ||  navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia);

        if (navigator.getUserMedia)
        {

            navigator.getUserMedia(
                {audio:true},
                streamAudio,
                function(e){console.log('No live audio input ' + e);}
            );

        }
        else
        {
            console.log("[op microphone] could not get usermedia");
        }

    }



};



