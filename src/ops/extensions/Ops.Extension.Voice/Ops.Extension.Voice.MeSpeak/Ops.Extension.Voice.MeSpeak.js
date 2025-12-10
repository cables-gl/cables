// MeSpeak JS

const voices =
[
    "ca (Catalan)",
    "cs (Czech)",
    "de (German)",
    "el (Greek)",
    "en/en (English)",
    "en/en-n (English, regional)",
    "en/en-rp (English, regional)",
    "en/en-sc (English, Scottish)",
    "en/en-us (English, US)",
    "en/en-wm (English, regional)",
    "eo (Esperanto)",
    "es (Spanish)",
    "es-la (Spanish, Latin America)",
    "fi (Finnish)",
    "fr (French)",
    "hu (Hungarian)",
    "it (Italian)",
    "kn (Kannada)",
    "la (Latin)",
    "lv (Latvian)",
    "nl (Dutch)",
    "pl (Polish)",
    "pt (Portuguese, Brazil)",
    "pt-pt (Portuguese, European)",
    "ro (Romanian)",
    "sk (Slovak)",
    "sv (Swedish)",
    "tr (Turkish)",
    "zh (Mandarin Chinese, Pinyin)",
    "zh-yue (Cantonese Chinese, Provisional)"
];

const enPath = op.patch.getFilePath(op.patch.getAssetPath() + "en.json");

const variants =
[
    "none",
    "f1",
    "f2",
    "f3",
    "f4",
    "f5", // for female voices
    "m1",
    "m2",
    "m3",
    "m4",
    "m5",
    "m6",
    "m7", // for male voices
    "croak",
    "klatt",
    "klatt2",
    "klatt3",
    "whisper",
    "whisperf"
];

const
    text = op.inString("Text", "Hello"),
    say = op.inTriggerButton("Say"),
    amplitude = op.inFloatSlider("Amplitude", 1),
    pitch = op.inFloatSlider("Pitch", 0.5),
    speed = op.inInt("Speed (WPM)", 175),
    voice = op.inValueSelect("Voice", voices, "en/en (English)"),
    wordGap = op.inInt("Word Gap", 0),
    variant = op.inValueSelect("Variants", variants, "none"),
    lineBreak = op.inInt("Line-break length", 0),
    capitals = op.inInt("Capitals", 0),
    punct = op.inString("Punctuation", "False"),
    noStop = op.inBool("No Stop", 0),
    utf16 = op.inBool("UTF16", 0),
    ssml = op.inBool("SSML", 0),

    // volume = op.inFloatSlider("Volume", 1),
    speakLog = op.inBool("Log Console", 0),
    pan = op.inFloatSlider("Pan", 0.5), // remap values
    // rawData = op.inValueSelect("Raw Data", ["null", "base64", "mime", "array", "default"], "null"),
    // callback = op.inString("Callback Function"),
    // callbackID = op.inInt("Callback ID"),

    audioOutPort = op.outObject("Audio Out", null, "audioNode"),
    voicePlaying = op.outBool("Speaking", 0),
    voiceLoaded = op.outBool("Voice Loaded", 0);

voice.setUiAttribs({ "greyout": true }); // needs update yo add other voices
/* voice.onChange = function ()
                                                {
                                                    let voiceID = voice.get().replace(/\s*\(.*?\)\s *//* g, '');
                                                    /*meSpeak.loadVoice(voiceID);
                                                }; */

// audio objects
const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
const gainNode = audioCtx.createGain();
let audiostream;

op.onLoaded = function()
{
    loadVoice().then(cacheAudio).catch((error) =>
    {
        op.log("Error loading voice: " + error.message);
    });
};



// port change calls

const debouncedCacheAudio = debounce(cacheAudio, 100);

text.onChange = debouncedCacheAudio;
amplitude.onChange = debouncedCacheAudio;
pitch.onChange = debouncedCacheAudio;
speed.onChange = debouncedCacheAudio;
wordGap.onChange = debouncedCacheAudio;
variant.onChange = debouncedCacheAudio;
lineBreak.onChange = debouncedCacheAudio;
capitals.onChange = debouncedCacheAudio;
punct.onChange = debouncedCacheAudio;
noStop.onChange = debouncedCacheAudio;
utf16.onChange = debouncedCacheAudio;
ssml.onChange = debouncedCacheAudio;
speakLog.onChange = debouncedCacheAudio;
pan.onChange = debouncedCacheAudio;

say.onTriggered = playAudio;

// meSpeak.restartWithInstance();
op.log("Run mode:", meSpeak.getRunMode());
// functions

function loadVoice()
{
    voiceLoaded.set(false);
    return new Promise((resolve, reject) =>
    {
        meSpeak.loadVoice(enPath, function (success, msg)
        {
            op.log(success ? "Voice loaded" : "Voice failed: " + msg);
            voiceLoaded.set(success);
        });
    });
}

function cacheAudio()
{
    const options = {
        "amplitude": parseInt(100 * amplitude.get()),
        "pitch": parseInt(100 * pitch.get()),
        "speed": speed.get(),
        // 'voice': voiceID,
        "wordgap": wordGap.get(),
        "variant": variant.get() === "none" ? undefined : variant.get(),
        "linebreak": lineBreak.get(),
        "capitals": capitals.get(),
        "punct": punct.get(),
        "nostop": noStop.get(),
        "utf16": utf16.get(),
        "ssml": ssml.get(),

        "log": speakLog.get(),
        "pan": pan.get(),
        "rawdata": true
    };

    // for caching and playing back audio streams
    meSpeak.speak(text.get(), options, function (success, id, stream)
    {
        // data is ArrayBuffer of 8-bit uint
        audiostream = stream;
    });
}

function debounce(fn, delay)
{
    let timeoutId;
    return function (...args)
    {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { return fn.apply(this, args); }, delay);
    };
}

function playAudio()
{
    const stream = audiostream;
    if (!stream)
    {
        op.log("audiostream is undefined!");
        return;
    }

    voicePlaying.set(true);

    const clonedBuffer = stream.slice(0);

    audioCtx.decodeAudioData(clonedBuffer)
        .then((audioBuffer) =>
        {
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;

            const vol = typeof volume === "number" && isFinite(volume) ? volume : 1.0;
            gainNode.gain.value = vol;

            source.connect(gainNode);
            audioOutPort.set(gainNode);
            source.start();

            // Register callback
            source.onended = function () { voicePlaying.set(false); };
        })
        .catch((error) =>
        {
            op.log("Error decoding audio data:");
            voicePlaying.set(false);
        });
}
