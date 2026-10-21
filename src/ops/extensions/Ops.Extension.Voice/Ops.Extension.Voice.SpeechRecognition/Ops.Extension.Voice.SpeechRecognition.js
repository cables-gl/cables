const
    inLang = op.inString("Language", "en-US"),
    active = op.inBool("Active", true),
    inTrigger = op.inTriggerButton("Start"),
    result = op.outString("Result"),
    confidence = op.outNumber("Confidence"),
    outSupported = op.outBoolNum("Supported", false),
    outResult = op.outTrigger("New Result"),
    outActive = op.outBoolNum("Started", false);

const RecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition;

const FATAL_ERRORS = ["not-allowed", "service-not-allowed", "audio-capture", "network", "language-not-supported"];
const SILENT_ERRORS = ["aborted", "no-speech"];
const NETWORK_ERROR = "network";

const SPEECH_SERVICE_BRANDS = ["Google Chrome", "Microsoft Edge"];
const CHROMIUM_BRAND = "Chromium";
const NO_SERVICE_TEXT = "this browser has no speech recognition service";
const NETWORK_TEXT = "speech recognition service not reachable, or browser has no speech service";

let recognition = null;
let running = false;
let stoppedByError = false;

const supported = RecognitionApi != null && hasSpeechService();
outSupported.set(supported);

active.onChange =
    inTrigger.onTriggered = () =>
    {
        stoppedByError = false;
        update();
    };

inLang.onChange = () =>
{
    if (!recognition) return;
    recognition.lang = inLang.get();
    if (running) recognition.abort();
    else update();
};

op.onDelete = () =>
{
    if (!recognition) return;
    recognition.onend = null;
    recognition.abort();
};

if (supported) setup();
else if (RecognitionApi) op.setUiError("unsupported", NO_SERVICE_TEXT, 2);
else op.setUiError("unsupported", "speech recognition is not supported in this browser", 2);

function hasSpeechService()
{
    if (navigator.userAgent.includes("Electron/")) return false;

    const uaData = navigator.userAgentData;
    if (!uaData || !uaData.brands) return true;

    let isChromium = false;
    let hasService = false;
    for (let i = 0; i < uaData.brands.length; i++)
    {
        const brand = uaData.brands[i].brand;
        if (brand == CHROMIUM_BRAND) isChromium = true;
        if (SPEECH_SERVICE_BRANDS.includes(brand)) hasService = true;
    }
    return !isChromium || hasService;
}

function setup()
{
    recognition = new RecognitionApi();
    recognition.lang = inLang.get();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () =>
    {
        outActive.set(true);
    };

    recognition.onend = () =>
    {
        running = false;
        outActive.set(false);
        update();
    };

    recognition.onerror = (event) =>
    {
        if (FATAL_ERRORS.includes(event.error)) stoppedByError = true;
        if (SILENT_ERRORS.includes(event.error)) return;

        if (event.error == NETWORK_ERROR)
        {
            outSupported.set(false);
            op.setUiError("recerr", NETWORK_TEXT, 2);
            return;
        }

        op.setUiError("recerr", "recognition error: " + event.error + (event.message ? " " + event.message : ""), 1);
    };

    recognition.onresult = (event) =>
    {
        op.setUiError("recerr", null);
        outSupported.set(true);

        for (let i = event.resultIndex; i < event.results.length; i++)
        {
            const res = event.results[i];
            if (!res.isFinal) continue;

            result.set(res[0].transcript);
            confidence.set(res[0].confidence);
            outResult.trigger();
        }
    };

    update();
}

function update()
{
    if (!recognition) return;

    if (active.get() && !stoppedByError) start();
    else if (running) recognition.abort();
}

function start()
{
    if (running) return;

    try
    {
        recognition.start();
        running = true;
        op.setUiError("recerr", null);
    }
    catch (e)
    {
        op.setUiError("recerr", "could not start speech recognition: " + (e.message || e), 1);
    }
}
