const
    inLang=op.inString("Language","us-US"),
    active=op.inBool("Active",true),
    result=op.outString("Result"),
    confidence=op.outNumber("Confidence"),
    outSupported=op.outBool("Supported",false),
    outResult=op.outTrigger("New Result"),
    outActive=op.outBool("Started",false);


active.onChange=startStop;

window.SpeechRecognition = window.SpeechRecognition||window.webkitSpeechRecognition || window.mozSpeechRecognition;

var recognition=null;

inLang.onChange=changeLang;

function startStop()
{
    if(!recognition) return;

    try{

        if(active.get()!=outActive.get())
        {
            if(active.get()) recognition.start();
            else recognition.abort();
        }

    }
    catch(e)
    {
        console.log(e);
    }
}


op.init=function()
{
    startStop();
};

function changeLang()
{
    if(!recognition)return;

    recognition.lang = inLang.get();
    recognition.stop();

    setTimeout(function(){
        try{recognition.start();}catch(e){}},500);



}

startAPI();

function startAPI()
{
    if(window.SpeechRecognition)
    {
        outSupported.set(true);

        if(recognition) recognition.abort();

        recognition=new SpeechRecognition();

        recognition.lang = inLang.get();
        recognition.interimResults = false;
        recognition.maxAlternatives = 0;
        recognition.continuous=true;
        SpeechRecognition.interimResults=true;


        recognition.onstart = function() { outActive.set(true); };
        recognition.onstop = function(event) { outActive.set(false); };

        recognition.onresult = function(event) { op.log('recognition result'); };
        recognition.onerror = function(event) { op.log('recognition error',result); };


        recognition.onresult = function(event)
        {
            const idx=event.results.length-1;

            result.set(event.results[idx][0].transcript);
            confidence.set(event.results[idx][0].confidence);
            op.log('You said: ', event.results[idx][0].transcript);
            outResult.trigger();
        };

    }

}

