const
    inLang = op.inString("Language", "us-US"),
    active = op.inBool("Active", true),
    inTrigger = op.inTriggerButton("Start"),
    result = op.outString("Result"),
    confidence = op.outNumber("Confidence"),
    outSupported = op.outBool("Supported", false),
    outResult = op.outTrigger("New Result", ""),
    outActive = op.outBool("Started", false);

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition;
let recognition = null;
active.onChange = startStop;
inLang.onChange = changeLang;

startAPI();

op.init = function ()
{
    startStop();
};

inTrigger.onTriggered = () =>
{
    if (active.get() && !outActive.get()) recognition.start();
};

function startStop()
{
    if (!recognition) return;

    try
    {
        if (active.get() != outActive.get())
        {
            if (active.get()) recognition.start();
            else recognition.abort();
        }
    }
    catch (e)
    {
        op.logError(e);
    }
}

function changeLang()
{
    if (!recognition) return;

    recognition.lang = inLang.get();
    recognition.stop();

    setTimeout(function ()
    {
        try { recognition.start(); }
        catch (e) {}
    }, 500);
}

function startAPI()
{
    if (window.SpeechRecognition)
    {
        outSupported.set(true);

        if (recognition) recognition.abort();

        recognition = new SpeechRecognition();

        recognition.lang = inLang.get();
        recognition.interimResults = false;
        recognition.maxAlternatives = 0;
        recognition.continuous = true;
        SpeechRecognition.interimResults = true;

        recognition.onstart = function () { outActive.set(true); };
        recognition.onstop = function (event) { outActive.set(false); };
        recognition.onend = function (event) { outActive.set(false); };

        recognition.onresult = function (event) { op.log("recognition result"); };
        recognition.onerror = function (event) { op.log("recognition error", result); };

        recognition.onresult = function (event)
        {
            const idx = event.results.length - 1;

            result.set(event.results[idx][0].transcript);
            confidence.set(event.results[idx][0].confidence);
            op.log("You said: ", event.results[idx][0].transcript);
            outResult.trigger();
        };
    }
}
