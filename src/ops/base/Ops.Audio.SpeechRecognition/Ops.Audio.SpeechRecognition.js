op.name="SpeechRecognition";

var result=op.outValue("Result");

window.SpeechRecognition = window.SpeechRecognition||window.webkitSpeechRecognition || mozSpeechRecognition || window.mozSpeechRecognition;

var recognition=new SpeechRecognition();

recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 0;
recognition.continuous=true;
SpeechRecognition.interimResults=true;
recognition.start();

function restart()
{
    recognition.stop();
    recognition.abort();
    try
    {
        recognition.start();
    }
    catch(err)
    {
        // recognition.start();
    }
}

recognition.onstart = function() { op.log('recognition start'); };
recognition.onresult = function(event) { op.log('recognition result'); };
recognition.onstop = function(event) { op.log('recognition stop'); };
recognition.onerror = function(event) { op.log('recognition error',result); };


recognition.onresult = function(event)
{
    result.set(event.results[0][0].transcript);
    op.log('You said: ', event.results[0][0].transcript);
    restart();
};
