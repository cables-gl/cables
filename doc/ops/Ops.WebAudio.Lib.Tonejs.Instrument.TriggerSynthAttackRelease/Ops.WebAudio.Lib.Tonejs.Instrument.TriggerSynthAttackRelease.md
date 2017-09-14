# TriggerSynthAttackRelease

*Ops.WebAudio.Lib.Tonejs.Instrument.TriggerSynthAttackRelease*  

Triggers the attack of a synth and, after the `Duration` time, release.

Connect the `Synth`-input port to the `Audio Out` port of a synth-op (e.g. `FmSynth`).

## Input

### Synth [Object]

### Trigger Atack Release [Function]

Triggers attack followed by release of the synth connected to the `Synth` input port

### Note [String]

Which note to play, e.g. `C4` (middle C). You can also put in a frequency, e.g. `440`. You can use the `Note` op to make this more convenient. 

### Duration [String]

The time between the trigger of attack and release, so basically how long the tone is. You can use the op `ToneTime` to make this more convenient. Valid durations are e.g. `4n` (one quarter note), `1m` (one measure), `1.2` (1.2 seconds)

### Time [String]

When the note should be triggered, `+0` = now

### Velocity [Number]

How loud it is, default: `1.0`