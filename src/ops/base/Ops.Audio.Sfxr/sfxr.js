// Wave shapes
var SQUARE = 0;
var SAWTOOTH = 1;
var SINE = 2;
var NOISE = 3;

// Playback volume
var masterVolume = 1;

var OVERSAMPLING = 8;

// Declare sfxr in module scope for ESM strict mode compatibility
var sfxr;

/*** Core data structure ***/

// Sound generation parameters are on [0,1] unless noted SIGNED & thus
// on [-1,1]
function Params() {
  this.oldParams = true;  // Note what structure this is

  // Wave shape
  this.wave_type = SQUARE;

  // Envelope
  this.p_env_attack = 0;   // Attack time
  this.p_env_sustain = 0.3;  // Sustain time
  this.p_env_punch = 0;    // Sustain punch
  this.p_env_decay = 0.4;    // Decay time

  // Tone
  this.p_base_freq = 0.3;    // Start frequency
  this.p_freq_limit = 0;   // Min frequency cutoff
  this.p_freq_ramp = 0;    // Slide (SIGNED)
  this.p_freq_dramp = 0;   // Delta slide (SIGNED)
  // Vibrato
  this.p_vib_strength = 0; // Vibrato depth
  this.p_vib_speed = 0;    // Vibrato speed

  // Tonal change
  this.p_arp_mod = 0;      // Change amount (SIGNED)
  this.p_arp_speed = 0;    // Change speed

  // Square wave duty (proportion of time signal is high vs. low)
  this.p_duty = 0;         // Square duty
  this.p_duty_ramp = 0;    // Duty sweep (SIGNED)

  // Repeat
  this.p_repeat_speed = 0; // Repeat speed

  // Flanger
  this.p_pha_offset = 0;   // Flanger offset (SIGNED)
  this.p_pha_ramp = 0;     // Flanger sweep (SIGNED)

  // Low-pass filter
  this.p_lpf_freq = 1;     // Low-pass filter cutoff
  this.p_lpf_ramp = 0;     // Low-pass filter cutoff sweep (SIGNED)
  this.p_lpf_resonance = 0;// Low-pass filter resonance
  // High-pass filter
  this.p_hpf_freq = 0;     // High-pass filter cutoff
  this.p_hpf_ramp = 0;     // High-pass filter cutoff sweep (SIGNED)

  // Sample parameters
  this.sound_vol = 0.5;
  this.sample_rate = 44100;
  this.sample_size = 8;
}

/*** Helper functions ***/

function sqr(x) { return x * x }
function cube(x) { return x * x * x }
function sign(x) { return x < 0 ? -1 : 1 }
function log(x, b) { return Math.log(x) / Math.log(b); }
var pow = Math.pow;

function frnd(range) {
  return Math.random() * range;
}

function rndr(from, to) {
  return Math.random() * (to - from) + from;
}

function rnd(max) {
  return Math.floor(Math.random() * (max + 1));
}

/*** Import/export functions ***/

// http://stackoverflow.com/questions/3096646/how-to-convert-a-floating-point-number-to-its-binary-representation-ieee-754-i
function assembleFloat(sign, exponent, mantissa)
{
    return (sign << 31) | (exponent << 23) | (mantissa);
}

function floatToNumber(flt)
{
    if (isNaN(flt)) // Special case: NaN
        return assembleFloat(0, 0xFF, 0x1337); // Mantissa is nonzero for NaN

    var sign = (flt < 0) ? 1 : 0;
    flt = Math.abs(flt);
    if (flt == 0.0) // Special case: +-0
        return assembleFloat(sign, 0, 0);

    var exponent = Math.floor(Math.log(flt) / Math.LN2);
    if (exponent > 127 || exponent < -126) // Special case: +-Infinity (and huge numbers)
        return assembleFloat(sign, 0xFF, 0); // Mantissa is zero for +-Infinity

    var mantissa = flt / Math.pow(2, exponent);
    return assembleFloat(sign, exponent + 127, (mantissa * Math.pow(2, 23)) & 0x7FFFFF);
}

// http://stackoverflow.com/a/16001019
function numberToFloat(bytes) {
    var sign = (bytes & 0x80000000) ? -1 : 1;
    var exponent = ((bytes >> 23) & 0xFF) - 127;
    var significand = (bytes & ~(-1 << 23));

    if (exponent == 128) 
        return sign * ((significand) ? Number.NaN : Number.POSITIVE_INFINITY);

    if (exponent == -127) {
        if (significand == 0) return sign * 0.0;
        exponent = -126;
        significand /= (1 << 22);
    } else significand = (significand | (1 << 23)) / (1 << 23);

    return sign * significand * Math.pow(2, exponent);
}

// export parameter list to URL friendly base58 string
// https://gist.github.com/diafygi/90a3e80ca1c2793220e5/
var b58alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var params_order = [
  "wave_type",
  "p_env_attack",
  "p_env_sustain",
  "p_env_punch",
  "p_env_decay",
  "p_base_freq",
  "p_freq_limit",
  "p_freq_ramp",
  "p_freq_dramp",
  "p_vib_strength",
  "p_vib_speed",
  "p_arp_mod",
  "p_arp_speed",
  "p_duty",
  "p_duty_ramp",
  "p_repeat_speed",
  "p_pha_offset",
  "p_pha_ramp",
  "p_lpf_freq",
  "p_lpf_ramp",
  "p_lpf_resonance",
  "p_hpf_freq",
  "p_hpf_ramp"
];

var params_signed = ["p_freq_ramp", "p_freq_dramp", "p_arp_mod", "p_duty_ramp", "p_pha_offset", "p_pha_ramp", "p_lpf_ramp", "p_hpf_ramp"];

Params.prototype.toB58 = function() {
  var convert = [];
  for (var pi in params_order) {
    var p = params_order[pi];
    if (p == "wave_type") {
      convert.push(this[p]);
    } else if (p.indexOf("p_") == 0) {
      var val = this[p];
      val = floatToNumber(val);
      convert.push(0xff & val);
      convert.push(0xff & (val >> 8))
      convert.push(0xff & (val >> 16))
      convert.push(0xff & (val >> 24))
    }
  }
  return function(B,A){var d=[],s="",i,j,c,n;for(i in B){j=0,c=B[i];s+=c||s.length^i?"":1;while(j in d||c){n=d[j];n=n?n*256+c:c;c=n/58|0;d[j]=n%58;j++}}while(j--)s+=A[d[j]];return s}(convert, b58alphabet);
}

Params.prototype.fromB58 = function(b58encoded) {
  this.fromJSON(sfxr.b58decode(b58encoded));
  return this;
}

Params.prototype.fromJSON = function(struct) {
  for (var p in struct) {
    if (struct.hasOwnProperty(p)) {
      this[p] = struct[p];
    }
  }
  return this;
}

/*** Presets ***/

// These functions roll up random sounds appropriate to various
// typical game events:

Params.prototype.pickupCoin = function () {
  this.wave_type = SAWTOOTH;
  this.p_base_freq = 0.4 + frnd(0.5);
  this.p_env_attack = 0;
  this.p_env_sustain = frnd(0.1);
  this.p_env_decay = 0.1 + frnd(0.4);
  this.p_env_punch = 0.3 + frnd(0.3);
  if (rnd(1)) {
    this.p_arp_speed = 0.5 + frnd(0.2);
    this.p_arp_mod = 0.2 + frnd(0.4);
  }
  return this;
}

Params.prototype.laserShoot = function () {
  this.wave_type = rnd(2);
  if(this.wave_type === SINE && rnd(1))
    this.wave_type = rnd(1);
  if (rnd(2) === 0) {
    this.p_base_freq = 0.3 + frnd(0.6);
    this.p_freq_limit = frnd(0.1);
    this.p_freq_ramp = -0.35 - frnd(0.3);
  } else {
    this.p_base_freq = 0.5 + frnd(0.5);
    this.p_freq_limit = this.p_base_freq - 0.2 - frnd(0.6);
    if (this.p_freq_limit < 0.2) this.p_freq_limit = 0.2;
    this.p_freq_ramp = -0.15 - frnd(0.2);
  }
  if (this.wave_type === SAWTOOTH)
    this.p_duty = 1;
  if (rnd(1)) {
    this.p_duty = frnd(0.5);
    this.p_duty_ramp = frnd(0.2);
  } else {
    this.p_duty = 0.4 + frnd(0.5);
    this.p_duty_ramp = -frnd(0.7);
  }
  this.p_env_attack = 0;
  this.p_env_sustain = 0.1 + frnd(0.2);
  this.p_env_decay = frnd(0.4);
  if (rnd(1))
    this.p_env_punch = frnd(0.3);
  if (rnd(2) === 0) {
    this.p_pha_offset = frnd(0.2);
    this.p_pha_ramp = -frnd(0.2);
  }
  //if (rnd(1))
    this.p_hpf_freq = frnd(0.3);

  return this;
}

Params.prototype.explosion = function () {
  this.wave_type = NOISE;
  if (rnd(1)) {
    this.p_base_freq = sqr(0.1 + frnd(0.4));
    this.p_freq_ramp = -0.1 + frnd(0.4);
  } else {
    this.p_base_freq = sqr(0.2 + frnd(0.7));
    this.p_freq_ramp = -0.2 - frnd(0.2);
  }
  if (rnd(4) === 0)
    this.p_freq_ramp = 0;
  if (rnd(2) === 0)
    this.p_repeat_speed = 0.3 + frnd(0.5);
  this.p_env_attack = 0;
  this.p_env_sustain = 0.1 + frnd(0.3);
  this.p_env_decay = frnd(0.5);
  if (rnd(1)) {
    this.p_pha_offset = -0.3 + frnd(0.9);
    this.p_pha_ramp = -frnd(0.3);
  }
  this.p_env_punch = 0.2 + frnd(0.6);
  if (rnd(1)) {
    this.p_vib_strength = frnd(0.7);
    this.p_vib_speed = frnd(0.6);
  }
  if (rnd(2) === 0) {
    this.p_arp_speed = 0.6 + frnd(0.3);
    this.p_arp_mod = 0.8 - frnd(1.6);
  }

  return this;
}

Params.prototype.powerUp = function () {
  if (rnd(1)) {
    this.wave_type = SAWTOOTH;
    this.p_duty = 1;
  } else {
    this.p_duty = frnd(0.6);
  }
  this.p_base_freq = 0.2 + frnd(0.3);
  if (rnd(1)) {
    this.p_freq_ramp = 0.1 + frnd(0.4);
    this.p_repeat_speed = 0.4 + frnd(0.4);
  } else {
    this.p_freq_ramp = 0.05 + frnd(0.2);
    if (rnd(1)) {
      this.p_vib_strength = frnd(0.7);
      this.p_vib_speed = frnd(0.6);
    }
  }
  this.p_env_attack = 0;
  this.p_env_sustain = frnd(0.4);
  this.p_env_decay = 0.1 + frnd(0.4);

  return this;
}

Params.prototype.hitHurt = function () {
  this.wave_type = rnd(2);
  if (this.wave_type === SINE)
    this.wave_type = NOISE;
  if (this.wave_type === SQUARE)
    this.p_duty = frnd(0.6);
  if (this.wave_type === SAWTOOTH)
    this.p_duty = 1;
  this.p_base_freq = 0.2 + frnd(0.6);
  this.p_freq_ramp = -0.3 - frnd(0.4);
  this.p_env_attack = 0;
  this.p_env_sustain = frnd(0.1);
  this.p_env_decay = 0.1 + frnd(0.2);
  if (rnd(1))
    this.p_hpf_freq = frnd(0.3);
  return this;
}

Params.prototype.jump = function () {
  this.wave_type = SQUARE;
  this.p_duty = frnd(0.6);
  this.p_base_freq = 0.3 + frnd(0.3);
  this.p_freq_ramp = 0.1 + frnd(0.2);
  this.p_env_attack = 0;
  this.p_env_sustain = 0.1 + frnd(0.3);
  this.p_env_decay = 0.1 + frnd(0.2);
  if (rnd(1))
    this.p_hpf_freq = frnd(0.3);
  if (rnd(1))
    this.p_lpf_freq = 1 - frnd(0.6);
  return this;
}

Params.prototype.blipSelect = function () {
  this.wave_type = rnd(1);
  if (this.wave_type === SQUARE)
    this.p_duty = frnd(0.6);
  else
    this.p_duty = 1;
  this.p_base_freq = 0.2 + frnd(0.4);
  this.p_env_attack = 0;
  this.p_env_sustain = 0.1 + frnd(0.1);
  this.p_env_decay = frnd(0.2);
  this.p_hpf_freq = 0.1;
  return this;
}

Params.prototype.synth = function () {
  this.wave_type = rnd(1);
  this.p_base_freq = [0.2723171360931539, 0.19255692561524382, 0.13615778746815113][rnd(2)];
  this.p_env_attack = rnd(4) > 3 ? frnd(0.5) : 0;
  this.p_env_sustain = frnd(1);
  this.p_env_punch = frnd(1);
  this.p_env_decay = frnd(0.9) + 0.1;
  this.p_arp_mod = [0, 0, 0, 0, -0.3162, 0.7454, 0.7454][rnd(6)];
  this.p_arp_speed = frnd(0.5) + 0.4;
  this.p_duty = frnd(1);
  this.p_duty_ramp = rnd(2) == 2 ? frnd(1) : 0;
  this.p_lpf_freq = [1, 0.9 * frnd(1) * frnd(1) + 0.1][rnd(1)];
  this.p_lpf_ramp = rndr(-1, 1);
  this.p_lpf_resonance = frnd(1);
  this.p_hpf_freq = rnd(3) == 3 ? frnd(1) : 0;
  this.p_hpf_ramp = rnd(3) == 3 ? frnd(1) : 0;
  return this;
}

Params.prototype.tone = function () {
  this.wave_type = SINE;
  this.p_base_freq = 0.35173364; // 440 Hz
  this.p_env_attack = 0;
  this.p_env_sustain = 0.6641; // 1 sec
  this.p_env_decay = 0;
  this.p_env_punch = 0;
  return this;
}

Params.prototype.click = function() {
  const base = ["explosion", "hitHurt"][rnd(1)];
  this[base]();
  if (rnd(1)) {
    this.p_freq_ramp = -0.5 + frnd(1.0);
  }
  if (rnd(1)) {
    this.p_env_sustain = (frnd(0.4) + 0.2) * this.p_env_sustain;
    this.p_env_decay = (frnd(0.4) + 0.2) * this.p_env_decay;
  }
  if (rnd(3) == 0) {
    this.p_env_attack = frnd(0.3);
  }
  this.p_base_freq = 1 - frnd(0.25);
  this.p_hpf_freq = 1 - frnd(0.1);
  return this;
}

Params.prototype.random = function () {
  this.wave_type = rnd(3);
  if (rnd(1))
    this.p_base_freq = cube(frnd(2) - 1) + 0.5;
  else
    this.p_base_freq = sqr(frnd(1));
  this.p_freq_limit = 0;
  this.p_freq_ramp = Math.pow(frnd(2) - 1, 5);
  if (this.p_base_freq > 0.7 && this.p_freq_ramp > 0.2)
    this.p_freq_ramp = -this.p_freq_ramp;
  if (this.p_base_freq < 0.2 && this.p_freq_ramp < -0.05)
    this.p_freq_ramp = -this.p_freq_ramp;
  this.p_freq_dramp = Math.pow(frnd(2) - 1, 3);
  this.p_duty = frnd(2) - 1;
  this.p_duty_ramp = Math.pow(frnd(2) - 1, 3);
  this.p_vib_strength = Math.pow(frnd(2) - 1, 3);
  this.p_vib_speed = rndr(-1, 1);
  this.p_env_attack = cube(rndr(-1, 1));
  this.p_env_sustain = sqr(rndr(-1, 1));
  this.p_env_decay = rndr(-1, 1);
  this.p_env_punch = Math.pow(frnd(0.8), 2);
  if (this.p_env_attack + this.p_env_sustain + this.p_env_decay < 0.2) {
    this.p_env_sustain += 0.2 + frnd(0.3);
    this.p_env_decay += 0.2 + frnd(0.3);
  }
  this.p_lpf_resonance = rndr(-1, 1);
  this.p_lpf_freq = 1 - Math.pow(frnd(1), 3);
  this.p_lpf_ramp = Math.pow(frnd(2) - 1, 3);
  if (this.p_lpf_freq < 0.1 && this.p_lpf_ramp < -0.05)
    this.p_lpf_ramp = -this.p_lpf_ramp;
  this.p_hpf_freq = Math.pow(frnd(1), 5);
  this.p_hpf_ramp = Math.pow(frnd(2) - 1, 5);
  this.p_pha_offset = Math.pow(frnd(2) - 1, 3);
  this.p_pha_ramp = Math.pow(frnd(2) - 1, 3);
  this.p_repeat_speed = frnd(2) - 1;
  this.p_arp_speed = frnd(2) - 1;
  this.p_arp_mod = frnd(2) - 1;
  return this;
}

Params.prototype.mutate = function () {
  if (rnd(1)) this.p_base_freq += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_freq_ramp += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_freq_dramp += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_duty += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_duty_ramp += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_vib_strength += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_vib_speed += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_vib_delay += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_env_attack += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_env_sustain += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_env_decay += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_env_punch += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_lpf_resonance += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_lpf_freq += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_lpf_ramp += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_hpf_freq += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_hpf_ramp += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_pha_offset += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_pha_ramp += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_repeat_speed += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_arp_speed += frnd(0.1) - 0.05;
  if (rnd(1)) this.p_arp_mod += frnd(0.1) - 0.05;
  return this;
}

/*** Simpler namespaced functional API ***/

sfxr = {};

sfxr.toBuffer = function(synthdef) {
  return (new SoundEffect(synthdef)).getRawBuffer()["buffer"];
};

sfxr.toWebAudio = function(synthdef, audiocontext) {
  var sfx = new SoundEffect(synthdef);
  var buffer = sfx.getRawBuffer()["normalized"];
  if (audiocontext) {
    var buff = audiocontext.createBuffer(1, buffer.length, sfx.sampleRate);
    var nowBuffering = buff.getChannelData(0);
    for (var i = 0; i < buffer.length; i++) {
      nowBuffering[i] = buffer[i];
    }
    var proc = audiocontext.createBufferSource();
    proc.buffer = buff;
    return proc;
  }
};

sfxr.toWave = function(synthdef) {
  return (new SoundEffect(synthdef)).generate();
};

sfxr.toAudio = function(synthdef) {
  return sfxr.toWave(synthdef).getAudio();
}

sfxr.play = function(synthdef) {
  return sfxr.toAudio(synthdef).play();
}

sfxr.b58decode = function(b58encoded) {
  var decoded = function(S,A){var d=[],b=[],i,j,c,n;for(i in S){j=0,c=A.indexOf(S[i]);if(c<0)return undefined;c||b.length^i?i:b.push(0);while(j in d||c){n=d[j];n=n?n*58+c:c;c=n>>8;d[j]=n%256;j++}}while(j--)b.push(d[j]);return new Uint8Array(b)}(b58encoded,b58alphabet);
  var result = {};
  for (var pi in params_order) {
    var p = params_order[pi];
    var offset = (pi - 1) * 4 + 1;
    if (p == "wave_type") {
      result[p] = decoded[0];
    } else {
      var val = (decoded[offset] | (decoded[offset + 1] << 8) | (decoded[offset + 2] << 16) | (decoded[offset + 3] << 24));
      result[p] = numberToFloat(val);
    }
  }
  return result;
}

sfxr.b58encode = function(synthdef) {
  var p = new Params();
  p.fromJSON(synthdef);
  return p.toB58();
}

sfxr.generate = function(algorithm, options) {
  const p = new Params();
  const opts = options || {};
  p.sound_vol = opts["sound_vol"] || 0.25;
  p.sample_rate = opts["sample_rate"] || 44100;
  p.sample_size = opts["sample_size"] || 8;
  return p[algorithm]();
}

/*** Main entry point ***/

function SoundEffect(ps) {
  if (typeof(ps) == "string") {
    var PARAMS = new Params();
    if (ps.indexOf("#") == 0) {
      ps = ps.slice(1);
    }
    ps = PARAMS.fromB58(ps);
  }
  this.init(ps);
}

SoundEffect.prototype.init = function (ps) {
  this.parameters = ps;
  this.initForRepeat();  // First time through, this is a bit of a misnomer

  // Waveform shape
  this.waveShape = parseInt(ps.wave_type);

  // Filter
  this.fltw = Math.pow(ps.p_lpf_freq, 3) * 0.1;
  this.enableLowPassFilter = (ps.p_lpf_freq != 1);
  this.fltw_d = 1 + ps.p_lpf_ramp * 0.0001;
  this.fltdmp = 5 / (1 + Math.pow(ps.p_lpf_resonance, 2) * 20) *
    (0.01 + this.fltw);
  if (this.fltdmp > 0.8) this.fltdmp=0.8;
  this.flthp = Math.pow(ps.p_hpf_freq, 2) * 0.1;
  this.flthp_d = 1 + ps.p_hpf_ramp * 0.0003;

  // Vibrato
  this.vibratoSpeed = Math.pow(ps.p_vib_speed, 2) * 0.01;
  this.vibratoAmplitude = ps.p_vib_strength * 0.5;

  // Envelope
  this.envelopeLength = [
    Math.floor(ps.p_env_attack * ps.p_env_attack * 100000),
    Math.floor(ps.p_env_sustain * ps.p_env_sustain * 100000),
    Math.floor(ps.p_env_decay * ps.p_env_decay * 100000)
  ];
  this.envelopePunch = ps.p_env_punch;

  // Flanger
  this.flangerOffset = Math.pow(ps.p_pha_offset, 2) * 1020;
  if (ps.p_pha_offset < 0) this.flangerOffset = -this.flangerOffset;
  this.flangerOffsetSlide = Math.pow(ps.p_pha_ramp, 2) * 1;
  if (ps.p_pha_ramp < 0) this.flangerOffsetSlide = -this.flangerOffsetSlide;

  // Repeat
  this.repeatTime = Math.floor(Math.pow(1 - ps.p_repeat_speed, 2) * 20000
                               + 32);
  if (ps.p_repeat_speed === 0)
    this.repeatTime = 0;

  this.gain = Math.exp(ps.sound_vol) - 1;

  this.sampleRate = ps.sample_rate;
  this.bitsPerChannel = ps.sample_size;
}

SoundEffect.prototype.initForRepeat = function() {
  var ps = this.parameters;
  this.elapsedSinceRepeat = 0;

  this.period = 100 / (ps.p_base_freq * ps.p_base_freq + 0.001);
  this.periodMax = 100 / (ps.p_freq_limit * ps.p_freq_limit + 0.001);
  this.enableFrequencyCutoff = (ps.p_freq_limit > 0);
  this.periodMult = 1 - Math.pow(ps.p_freq_ramp, 3) * 0.01;
  this.periodMultSlide = -Math.pow(ps.p_freq_dramp, 3) * 0.000001;

  this.dutyCycle = 0.5 - ps.p_duty * 0.5;
  this.dutyCycleSlide = -ps.p_duty_ramp * 0.00005;

  if (ps.p_arp_mod >= 0)
    this.arpeggioMultiplier = 1 - Math.pow(ps.p_arp_mod, 2) * .9;
  else
    this.arpeggioMultiplier = 1 + Math.pow(ps.p_arp_mod, 2) * 10;
  this.arpeggioTime = Math.floor(Math.pow(1 - ps.p_arp_speed, 2) * 20000 + 32);
  if (ps.p_arp_speed === 1)
    this.arpeggioTime = 0;
}

SoundEffect.prototype.getRawBuffer = function () {
  var fltp = 0;
  var fltdp = 0;
  var fltphp = 0;

  var noise_buffer = Array(32);
  for (var i = 0; i < 32; ++i)
    noise_buffer[i] = Math.random() * 2 - 1;

  var envelopeStage = 0;
  var envelopeElapsed = 0;

  var vibratoPhase = 0;

  var phase = 0;
  var ipp = 0;
  var flanger_buffer = Array(1024);
  for (var i = 0; i < 1024; ++i)
    flanger_buffer[i] = 0;

  var num_clipped = 0;

  var buffer = [];
  var normalized = [];

  var sample_sum = 0;
  var num_summed = 0;
  var summands = Math.floor(44100 / this.sampleRate);

  for(var t = 0; ; ++t) {

    // Repeats
    if (this.repeatTime != 0 && ++this.elapsedSinceRepeat >= this.repeatTime)
      this.initForRepeat();

    // Arpeggio (single)
    if(this.arpeggioTime != 0 && t >= this.arpeggioTime) {
      this.arpeggioTime = 0;
      this.period *= this.arpeggioMultiplier;
    }

    // Frequency slide, and frequency slide slide!
    this.periodMult += this.periodMultSlide;
    this.period *= this.periodMult;
    if(this.period > this.periodMax) {
      this.period = this.periodMax;
      if (this.enableFrequencyCutoff)
        break;
    }

    // Vibrato
    var rfperiod = this.period;
    if (this.vibratoAmplitude > 0) {
      vibratoPhase += this.vibratoSpeed;
      rfperiod = this.period * (1 + Math.sin(vibratoPhase) * this.vibratoAmplitude);
    }
    var iperiod = Math.floor(rfperiod);
    if (iperiod < OVERSAMPLING) iperiod = OVERSAMPLING;

    // Square wave duty cycle
    this.dutyCycle += this.dutyCycleSlide;
    if (this.dutyCycle < 0) this.dutyCycle = 0;
    if (this.dutyCycle > 0.5) this.dutyCycle = 0.5;

    // Volume envelope
    if (++envelopeElapsed > this.envelopeLength[envelopeStage]) {
      envelopeElapsed = 0;
      if (++envelopeStage > 2)
        break;
    }
    var env_vol;
    var envf = envelopeElapsed / this.envelopeLength[envelopeStage];
    if (envelopeStage === 0) {         // Attack
      env_vol = envf;
    } else if (envelopeStage === 1) {  // Sustain
      env_vol = 1 + (1 - envf) * 2 * this.envelopePunch;
    } else {                           // Decay
      env_vol = 1 - envf;
    }

    // Flanger step
    this.flangerOffset += this.flangerOffsetSlide;
    var iphase = Math.abs(Math.floor(this.flangerOffset));
    if (iphase > 1023) iphase = 1023;

    if (this.flthp_d != 0) {
      this.flthp *= this.flthp_d;
      if (this.flthp < 0.00001)
        this.flthp = 0.00001;
      if (this.flthp > 0.1)
        this.flthp = 0.1;
    }

    // 8x oversampling
    var sample = 0;
    for (var si = 0; si < OVERSAMPLING; ++si) {
      var sub_sample = 0;
      phase++;
      if (phase >= iperiod) {
        phase %= iperiod;
        if (this.waveShape === NOISE)
          for(var i = 0; i < 32; ++i)
            noise_buffer[i] = Math.random() * 2 - 1;
      }

      // Base waveform
      var fp = phase / iperiod;
      if (this.waveShape === SQUARE) {
        if (fp < this.dutyCycle)
          sub_sample=0.5;
        else
          sub_sample=-0.5;
      } else if (this.waveShape === SAWTOOTH) {
        if (fp < this.dutyCycle)
          sub_sample = -1 + 2 * fp/this.dutyCycle;
        else
          sub_sample = 1 - 2 * (fp-this.dutyCycle)/(1-this.dutyCycle);
      } else if (this.waveShape === SINE) {
        sub_sample = Math.sin(fp * 2 * Math.PI);
      } else if (this.waveShape === NOISE) {
        sub_sample = noise_buffer[Math.floor(phase * 32 / iperiod)];
      } else {
        throw "ERROR: Bad wave type: " + this.waveShape;
      }

      // Low-pass filter
      var pp = fltp;
      this.fltw *= this.fltw_d;
      if (this.fltw < 0) this.fltw = 0;
      if (this.fltw > 0.1) this.fltw = 0.1;
      if (this.enableLowPassFilter) {
        fltdp += (sub_sample - fltp) * this.fltw;
        fltdp -= fltdp * this.fltdmp;
      } else {
        fltp = sub_sample;
        fltdp = 0;
      }
      fltp += fltdp;

      // High-pass filter
      fltphp += fltp - pp;
      fltphp -= fltphp * this.flthp;
      sub_sample = fltphp;

      // Flanger
      flanger_buffer[ipp & 1023] = sub_sample;
      sub_sample += flanger_buffer[(ipp - iphase + 1024) & 1023];
      ipp = (ipp + 1) & 1023;

      // final accumulation and envelope application
      sample += sub_sample * env_vol;
    }

    // Accumulate samples appropriately for sample rate
    sample_sum += sample;
    if (++num_summed >= summands) {
      num_summed = 0;
      sample = sample_sum / summands;
      sample_sum = 0;
    } else {
      continue;
    }

    sample = sample / OVERSAMPLING * masterVolume;
    sample *= this.gain;

    // store the original normalized floating point sample
    normalized.push(sample);

    if (this.bitsPerChannel === 8) {
      // Rescale [-1, 1) to [0, 256)
      sample = Math.floor((sample + 1) * 128);
      if (sample > 255) {
        sample = 255;
        ++num_clipped;
      } else if (sample < 0) {
        sample = 0;
        ++num_clipped;
      }
      buffer.push(sample);
    } else {
      // Rescale [-1, 1) to [-32768, 32768)
      sample = Math.floor(sample * (1<<15));
      if (sample >= (1<<15)) {
        sample = (1 << 15)-1;
        ++num_clipped;
      } else if (sample < -(1<<15)) {
        sample = -(1 << 15);
        ++num_clipped;
      }
      buffer.push(sample & 0xFF);
      buffer.push((sample >> 8) & 0xFF);
    }
  }
  
  return {
    "buffer": buffer,
    "normalized": normalized,
    "clipped": num_clipped,
  }
}

SoundEffect.prototype.generate = function() {
  var rendered = this.getRawBuffer();
  var wave = new RIFFWAVE();
  wave.header.sampleRate = this.sampleRate;
  wave.header.bitsPerSample = this.bitsPerChannel;
  wave.Make(rendered.buffer);
  wave.clipping = rendered.clipped;
  wave.buffer = rendered.normalized;
  wave.getAudio = _sfxr_getAudioFn(wave);
  return wave;
}

var _actx = null;
var _sfxr_getAudioFn = function(wave) {
  return function() {
    // check for procedural audio
    var actx = null;
    if (!_actx) {
      if ('AudioContext' in window) {
        _actx = new AudioContext();
      } else if ('webkitAudioContext' in window) {
        _actx = new webkitAudioContext();
      }
    }
    actx = _actx;
    
    if (actx) {
      var buff = actx.createBuffer(1, wave.buffer.length, wave.header.sampleRate);
      var nowBuffering = buff.getChannelData(0);
      for (var i=0;i<wave.buffer.length;i++) {
        nowBuffering[i] = wave.buffer[i];
      }
      var volume = 1.0;
      var obj = {
        "channels": [],
        "setVolume": function(v) { volume = v; return obj; },
        "play": function() {
          var proc = actx.createBufferSource();
          proc.buffer = buff;
          var gainNode = actx.createGain()
          gainNode.gain.value = volume;
          gainNode.connect(actx.destination)
          proc.connect(gainNode);
          if (proc["start"]) {
            proc.start();
          } else if (proc["noteOn"]) {
            proc.noteOn(0);
          }
          this.channels.push(proc);
          return proc;
        }
      };
      return obj;
    } else {
      var audio = new Audio();
      audio.src = wave.dataURI;
      return audio;
    }
  };
};

/*** conversions from slider values, internal, and units ***/

// convert from slider values to internal representation

var sliders = {
  p_env_attack:  function (v) { return v * v * 100000.0 },
  p_env_sustain: function (v) { return v * v * 100000.0 },
  p_env_punch:   function (v) { return v },
  p_env_decay:   function (v) { return v * v * 100000.0 },

  p_base_freq:  function (v) { return 8 * 44100 * (v * v + 0.001) / 100 },
  p_freq_limit: function (v) { return 8 * 44100 * (v * v + 0.001) / 100 },
  p_freq_ramp:  function (v) { return 1.0 - Math.pow(v, 3.0) * 0.01 },
  p_freq_dramp: function (v) { return -Math.pow(v, 3.0) * 0.000001 },

  p_vib_speed:    function (v) { return Math.pow(v, 2.0) * 0.01 },
  p_vib_strength: function (v) { return v * 0.5 },

  p_arp_mod:   function (v) { 
    return v >= 0 ? 1.0 - Math.pow(v, 2) * 0.9 : 1.0 + Math.pow(v, 2) * 10; },
  p_arp_speed: function (v) { return (v === 1.0) ? 0 :
                              Math.floor(Math.pow(1.0 - v, 2.0) * 20000 + 32)},

  p_duty:      function (v) { return 0.5 - v * 0.5; },
  p_duty_ramp: function (v) { return -v * 0.00005 },

  p_repeat_speed: function (v) { return (v === 0) ? 0 :
                                 Math.floor(Math.pow(1-v, 2) * 20000) + 32 },

  p_pha_offset: function (v) { return (v < 0 ? -1 : 1) * Math.pow(v,2)*1020 },
  p_pha_ramp:   function (v) { return (v < 0 ? -1 : 1) * Math.pow(v,2) },

  p_lpf_freq:   function (v) { return Math.pow(v, 3) * 0.1 },
  p_lpf_ramp:   function (v) { return 1.0 + v * 0.0001 },
  p_lpf_resonance: function (v) { return 5.0 / (1.0 + Math.pow(v, 2) * 20) }, // * (0.01 + fltw);

  p_hpf_freq: function (v) { return Math.pow(v, 2) * 0.1 },
  p_hpf_ramp: function (v) { return 1.0 + v * 0.0003 },

  sound_vol: function (v) { return Math.exp(v) - 1; }
};

var sliders_inverse = {
  p_env_attack:  function (v) { return Math.sqrt(v / 100000.0); },
  p_env_sustain: function (v) { return Math.sqrt(v / 100000.0); },
  p_env_punch:   function (v) { return v; },
  p_env_decay:   function (v) { return Math.sqrt(v / 100000.0); },

  p_base_freq:  function (v) { return Math.sqrt(v * 100 / 8 / 44100 - 0.001); },
  p_freq_limit: function (v) { return Math.sqrt(v * 100 / 8 / 44100 - 0.001); },
  p_freq_ramp:  function (v) { return Math.cbrt((1.0 - v) / 0.01); },
  p_freq_dramp: function (v) { return Math.cbrt(v / -0.000001); },

  p_vib_speed:    function (v) { return Math.sqrt(v / 0.01); },
  p_vib_strength: function (v) { return v / 0.5; },

  p_arp_mod:   function (v) {
    return v < 1 ? Math.sqrt((1.0 - v) / 0.9) : -Math.sqrt((v - 1.0) / 10.0);
  },
  p_arp_speed: function (v) { return (v === 0) ? 1.0 :
                              ( (1.0 - Math.sqrt((v - (v < 100 ? 30 : 32)) / 20000)))},

  p_duty:      function (v) { return (v - 0.5) / -0.5; },
  p_duty_ramp: function (v) { return v / -0.00005 },

  p_repeat_speed: function (v) { return v === 0 ? 0 : -(Math.sqrt((v - 32) / 20000) - 1.0) },

  p_pha_offset: function (v) { return (v < 0 ? -1 : 1) * Math.sqrt(Math.abs(v) / 1020) },
  p_pha_ramp:   function (v) { return (v < 0 ? -1 : 1) * Math.sqrt(Math.abs(v)) },

  p_lpf_freq:   function (v) { return Math.cbrt(v / 0.1); },
  p_lpf_ramp:   function (v) { return (v - 1.0) / 0.0001; },
  p_lpf_resonance: function (v) { return Math.sqrt((1.0 / (v / 5.0) - 1) / 20) },

  p_hpf_freq: function (v) { return Math.sqrt(v / 0.1); },
  p_hpf_ramp: function (v) { return (v - 1.0) / 0.0003; },
  sound_vol: function (v) { return Math.log(v + 1);; }
}

// convert from internal representation to domain value without units

var domain = {
  p_env_attack:  function (v) { return (v / 44100); },
  p_env_sustain: function (v) { return (v / 44100); },
  p_env_punch:   function (v) { return (v * 100); },
  p_env_decay:   function (v) { return (v / 44100); },

  p_base_freq:   function (v) { return v; },
  p_freq_limit:  function (v) { return v; },
  p_freq_ramp:   function (v) { return (44100*Math.log(v)/Math.log(0.5)); },
  p_freq_dramp:  function (v) { return (v*44100 / Math.pow(2, -44101./44100)); },

  p_vib_speed:    function (v) { return (441000/64. * v); },
  p_vib_strength: function (v) { return (v*100); },

  p_arp_mod:   function (v) { return (1./v); },
  p_arp_speed: function (v) { return (v / 44100); },

  p_duty:      function (v) { return (100 * v); },
  p_duty_ramp: function (v) { return (8 * 44100 * v); },

  p_repeat_speed: function (v) { return v === 0 ? 0 : (44100./v); },

  p_pha_offset: function (v) { return (1000*v/44100); },
  p_pha_ramp:   function (v) { return (1000*v); },

  p_lpf_freq:   function (v) { return (v === .1) ? 0 : 8 * 44100 * v / (1-v); },
  p_lpf_ramp:  function (v) { return Math.pow(v, 44100); },
  p_lpf_resonance: function (v) { return (100*(1-v*.11));},

  p_hpf_freq:   function (v) { return 8 * 44100 * v / (1-v); },
  p_hpf_ramp: function (v) { return Math.pow(v, 44100); },

  sound_vol: function (v) { return 10 * Math.log(v*v) / Math.log(10); }
}

var domain_inverse = {
  p_env_attack:  function (v) { return (v * 44100); },
  p_env_sustain: function (v) { return (v * 44100); },
  p_env_punch:   function (v) { return (v / 100); },
  p_env_decay:   function (v) { return (v * 44100); },

  p_base_freq:   function (v) { return v; },
  p_freq_limit:  function (v) { return v; },
  p_freq_ramp:   function (v) { return Math.exp(Math.log(0.5) * v / 44100); },
  p_freq_dramp:  function (v) { return v * Math.pow(2, -44101./44100) / 44100; },

  p_vib_speed:    function (v) { return (64. / 441000) * v; },
  p_vib_strength: function (v) { return (v / 100); },

  p_arp_mod:   function (v) { return (1. / v); },
  p_arp_speed: function (v) { return (v * 44100); },

  p_duty:      function (v) { return (v / 100); },
  p_duty_ramp: function (v) { return (v / (8 * 44100)); },

  p_repeat_speed: function (v) { return v <= 0 ? 0 : v > 1378 ? 32 : (44100 / v); },

  p_pha_offset: function (v) { return (v / 1000) * 44100; },
  p_pha_ramp:   function (v) { return (v / 1000); },

  p_lpf_freq:   function (v) { return (v / (v + 8 * 44100)); },
  p_lpf_ramp:  function (v) { return Math.pow(v, 1 / 44100); },
  p_lpf_resonance: function (v) { return (1 - v / 100) / .11; },

  p_hpf_freq:   function (v) { return (v / (v + 8 * 44100)); },
  p_hpf_ramp: function (v) { return Math.pow(v, 1 / 44100); },

  sound_vol: function (v) { return Math.sqrt(Math.pow(10, v / 10)); }
}

// convert from internal representation to printable units

var units = {
  p_env_attack:  function (v) { return (v / 44100).toPrecision(4) + ' sec' },
  p_env_sustain: function (v) { return (v / 44100).toPrecision(4) + ' sec' },
  p_env_punch:   function (v) { return '+' + (v * 100).toPrecision(4) + '%'},
  p_env_decay:   function (v) { return (v / 44100).toPrecision(4) + ' sec' },
  
  p_base_freq:   function (v) { return v.toPrecision(4) + 'Hz' },
  p_freq_limit:  function (v) { return v.toPrecision(4) + 'Hz' },
  p_freq_ramp:   function (v) { 
    return (44100*Math.log(v)/Math.log(0.5)).toPrecision(4) + ' 8va/sec'; },
  p_freq_dramp:  function (v) { 
    return (v*44100 / Math.pow(2, -44101./44100)).toExponential(3) +
      ' 8va/s^2'; },

  p_vib_speed:    function (v) { return v === 0 ? 'OFF' : 
                                 (441000/64. * v).toPrecision(4) + ' Hz'},
  p_vib_strength: function (v) { return v === 0 ? 'OFF' : 
                                 '&plusmn; ' + (v*100).toPrecision(4) + '%' },

  p_arp_mod:   function (v) { return ((v === 1) ? 'OFF' : 
                                      'x ' + (1./v).toPrecision(4)) },
  p_arp_speed: function (v) { return (v === 0 ? 'OFF' :
                                      (v / 44100).toPrecision(4) +' sec') },

  p_duty:      function (v) { return (100 * v).toPrecision(4) + '%'; },
  p_duty_ramp: function (v) { return (8 * 44100 * v).toPrecision(4) +'%/sec'},

  p_repeat_speed: function (v) { return v === 0 ? 'OFF' : 
                                 (44100/v).toPrecision(4) + ' Hz' },

  p_pha_offset: function (v) { return v === 0 ? 'OFF' :
                               (1000*v/44100).toPrecision(4) + ' msec' },
  // Not so sure about this:
  p_pha_ramp:   function (v) { return v === 0 ? 'OFF' :
               (1000*v).toPrecision(4) + ' msec/sec' },

  p_lpf_freq:   function (v) { 
    return (v === .1) ? 'OFF' : Math.round(8 * 44100 * v / (1-v)) + ' Hz'; },
  p_lpf_ramp:  function (v) {  if (v === 1) return 'OFF';
    return Math.pow(v, 44100).toPrecision(4) + ' ^sec'; },
  p_lpf_resonance: function (v) { return (100*(1-v*.11)).toPrecision(4)+'%';},

  p_hpf_freq:   function (v) { 
    return (v === 0) ? 'OFF' : Math.round(8 * 44100 * v / (1-v)) + ' Hz'; },
  p_hpf_ramp: function (v) {  if (v === 1) return 'OFF';
    return Math.pow(v, 44100).toPrecision(4) + ' ^sec'; },

  sound_vol: function (v) { 
    v = 10 * Math.log(v*v) / Math.log(10);
    var sign = v >= 0 ? '+' : '';
    return sign + v.toPrecision(4) + ' dB'; 
  }
};

/*** Plumbing ***/

(function (root, factory) {
  // Handle ESM where 'this' is undefined
  var globalRoot = root || (typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {}));
  if(typeof define === "function" && define.amd) {
    // Now we're wrapping the factory and assigning the return
    // value to the root (window) and returning it as well to
    // the AMD loader.
    define(["./riffwave"], function(RIFFWAVE){
      return (globalRoot.jsfxr = factory(RIFFWAVE));
    });
  } else if(typeof module === "object" && module.exports) {
    // I've not encountered a need for this yet, since I haven't
    // run into a scenario where plain modules depend on CommonJS
    // *and* I happen to be loading in a CJS browser environment
    // but I'm including it for the sake of being thorough
    var RIFFWAVE = require("./riffwave.js");
    module.exports = (globalRoot.jsfxr = factory(RIFFWAVE));
  } else {
    globalRoot.jsfxr = factory(globalRoot.RIFFWAVE);
  }
}(this, function(RIFFWAVE) {
  // module code here....
  return {
    "sfxr": sfxr,
    "convert": {
      "sliders": sliders,
      "domain": domain,
      "sliders_inverse": sliders_inverse,
      "domain_inverse": domain_inverse,
      "units": units,
    },
    "parameters": {
      "order": params_order,
      "signed": params_signed,
    },
    "Params": Params,
    "SoundEffect": SoundEffect,
    "waveforms": {
      "SQUARE": SQUARE,
      "SAWTOOTH": SAWTOOTH,
      "SINE": SINE,
      "NOISE": NOISE
    }
  };
}));
