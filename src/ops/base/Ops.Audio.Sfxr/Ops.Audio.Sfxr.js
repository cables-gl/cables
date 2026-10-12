const PRESETS = {
    "Random": "random",
    "Pickup Coin": "pickupCoin",
    "Laser Shoot": "laserShoot",
    "Explosion": "explosion",
    "Power Up": "powerUp",
    "Hit Hurt": "hitHurt",
    "Jump": "jump",
    "Blip Select": "blipSelect",
    "Synth": "synth",
    "Tone": "tone",
    "Click": "click"
};
const WAVE_TYPES = ["Square", "Sawtooth", "Sine", "Noise"];
const SAMPLE_RATES = ["44100", "22050", "11025", "5512"];
const SAMPLE_SIZES = ["8", "16"];
const UPDATE_DELAY_MS = 30;

const
    inPreset = op.inDropDown("Randomize Type", Object.keys(PRESETS), "Random"),
    inRandomize = op.inTriggerButton("Randomize"),
    inMutate = op.inTriggerButton("Mutate"),
    inPlay = op.inTriggerButton("Play"),

    inWave = op.inSwitch("Wave", WAVE_TYPES, "Square"),

    inAttack = op.inFloatSlider("Attack Time", 0),
    inSustain = op.inFloatSlider("Sustain Time", 0.3),
    inPunch = op.inFloatSlider("Sustain Punch", 0),
    inDecay = op.inFloatSlider("Decay Time", 0.4),

    inFreq = op.inFloatSlider("Start Frequency", 0.3),
    inFreqLimit = op.inFloatSlider("Min Frequency", 0),
    inSlide = op.inFloatSlider("Slide", 0, -1, 1),
    inDeltaSlide = op.inFloatSlider("Delta Slide", 0, -1, 1),

    inVibDepth = op.inFloatSlider("Vibrato Depth", 0),
    inVibSpeed = op.inFloatSlider("Vibrato Speed", 0),

    inArpMod = op.inFloatSlider("Change Amount", 0, -1, 1),
    inArpSpeed = op.inFloatSlider("Change Speed", 0),

    inDuty = op.inFloatSlider("Square Duty", 0),
    inDutySweep = op.inFloatSlider("Duty Sweep", 0, -1, 1),

    inRepeat = op.inFloatSlider("Repeat Speed", 0),

    inPhaOffset = op.inFloatSlider("Phaser Offset", 0, -1, 1),
    inPhaSweep = op.inFloatSlider("Phaser Sweep", 0, -1, 1),

    inLpfCutoff = op.inFloatSlider("Low Pass Cutoff", 1),
    inLpfSweep = op.inFloatSlider("Low Pass Cutoff Sweep", 0, -1, 1),
    inLpfResonance = op.inFloatSlider("Low Pass Resonance", 0),
    inHpfCutoff = op.inFloatSlider("High Pass Cutoff", 0),
    inHpfSweep = op.inFloatSlider("High Pass Cutoff Sweep", 0, -1, 1),

    inVolume = op.inFloatSlider("Volume", 0.5),
    inSampleRate = op.inDropDown("Sample Rate", SAMPLE_RATES, "44100"),
    inSampleSize = op.inSwitch("Sample Size", SAMPLE_SIZES, "8"),

    outDataUrl = op.outString("Data URL"),
    outSound = op.outObject("Sound"),
    outDuration = op.outNumber("Duration"),
    outClipping = op.outBoolNum("Clipping");

const params = [
    { "key": "p_env_attack", "port": inAttack },
    { "key": "p_env_sustain", "port": inSustain },
    { "key": "p_env_punch", "port": inPunch },
    { "key": "p_env_decay", "port": inDecay },
    { "key": "p_base_freq", "port": inFreq },
    { "key": "p_freq_limit", "port": inFreqLimit },
    { "key": "p_freq_ramp", "port": inSlide },
    { "key": "p_freq_dramp", "port": inDeltaSlide },
    { "key": "p_vib_strength", "port": inVibDepth },
    { "key": "p_vib_speed", "port": inVibSpeed },
    { "key": "p_arp_mod", "port": inArpMod },
    { "key": "p_arp_speed", "port": inArpSpeed },
    { "key": "p_duty", "port": inDuty },
    { "key": "p_duty_ramp", "port": inDutySweep },
    { "key": "p_repeat_speed", "port": inRepeat },
    { "key": "p_pha_offset", "port": inPhaOffset },
    { "key": "p_pha_ramp", "port": inPhaSweep },
    { "key": "p_lpf_freq", "port": inLpfCutoff },
    { "key": "p_lpf_ramp", "port": inLpfSweep },
    { "key": "p_lpf_resonance", "port": inLpfResonance },
    { "key": "p_hpf_freq", "port": inHpfCutoff },
    { "key": "p_hpf_ramp", "port": inHpfSweep }
];

op.setPortGroup("Generate", [inPreset, inRandomize, inMutate, inPlay]);
op.setPortGroup("Envelope", [inAttack, inSustain, inPunch, inDecay]);
op.setPortGroup("Frequency", [inWave, inFreq, inFreqLimit, inSlide, inDeltaSlide]);
op.setPortGroup("Vibrato", [inVibDepth, inVibSpeed]);
op.setPortGroup("Arpeggio", [inArpMod, inArpSpeed]);
op.setPortGroup("Duty Cycle", [inDuty, inDutySweep]);
op.setPortGroup("Retrigger", [inRepeat]);
op.setPortGroup("Phaser", [inPhaOffset, inPhaSweep]);
op.setPortGroup("Filter", [inLpfCutoff, inLpfSweep, inLpfResonance, inHpfCutoff, inHpfSweep]);
op.setPortGroup("Output", [inVolume, inSampleRate, inSampleSize]);

let updateTimeout = null;
let audio = null;

for (let i = 0; i < params.length; i++) params[i].port.onChange = updateSoon;
inWave.onChange = updateSoon;
inVolume.onChange = updateSoon;
inSampleRate.onChange = updateSoon;
inSampleSize.onChange = updateSoon;

inRandomize.onTriggered = randomize;
inMutate.onTriggered = mutate;
inPlay.onTriggered = play;

op.onDelete = () =>
{
    clearTimeout(updateTimeout);
    if (audio) audio.pause();
};

update();

function updateSoon()
{
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(update, UPDATE_DELAY_MS);
}

function getSound()
{
    const sound = new jsfxr.Params();
    sound.wave_type = WAVE_TYPES.indexOf(inWave.get());
    for (let i = 0; i < params.length; i++) sound[params[i].key] = params[i].port.get();
    sound.sound_vol = inVolume.get();
    sound.sample_rate = Number(inSampleRate.get());
    sound.sample_size = Number(inSampleSize.get());
    return sound;
}

function setSound(sound)
{
    inWave.set(WAVE_TYPES[sound.wave_type]);

    for (let i = 0; i < params.length; i++)
    {
        let min = 0;
        if (jsfxr.parameters.signed.includes(params[i].key)) min = -1;
        params[i].port.set(CABLES.clamp(sound[params[i].key], min, 1));
    }

    op.refreshParams();
    update();
}

function randomize()
{
    const sound = new jsfxr.Params();
    sound[PRESETS[inPreset.get()]]();
    setSound(sound);
    play();
}

function mutate()
{
    setSound(getSound().mutate());
    play();
}

function update()
{
    clearTimeout(updateTimeout);
    op.setUiError("generate", null);

    try
    {
        const sound = getSound();
        const wave = jsfxr.sfxr.toWave(sound);

        outSound.setRef(sound);
        outDuration.set(wave.buffer.length / sound.sample_rate);
        outClipping.set(wave.clipping);
        outDataUrl.set(wave.dataURI);
    }
    catch (e)
    {
        op.setUiError("generate", "could not generate sound: " + e.message);
    }
}

function play()
{
    if (!outDataUrl.get()) return;
    if (audio) audio.pause();

    audio = new Audio(outDataUrl.get());
    audio.volume = CABLES.clamp(op.patch.config.masterVolume, 0, 1);
    audio.play().catch(() => {});
}
