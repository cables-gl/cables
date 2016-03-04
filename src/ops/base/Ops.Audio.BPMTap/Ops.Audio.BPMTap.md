# Ops.Audio.BPMTap

If you want to generate visuals in sync to music and don't have access to the audio signal directly you can use `BPMTap` – it let’s you tap in the bpm (beats per minute) of an audio track and triggers on beat then. There are various output ports, one for every beat (1, 2, 3, 4) and one for every beat individually, also there is an `offbeat` trigger, which triggers in between the main beats (typically used for open hi-hats in electronic dance music).
Once you tapped your beat in, `BPMTap` will calculate the `bpm` and start to trigger after you stopped to tap for one bar.  
If you want to start over, just hit `tap` again after some seconds.

## In Ports

### exe

Steady signal, connect e.g. to `trigger` port of `renderer` operator.

### tap

Press the `tap`-button multiple times to tap in a beat. Once you stopped `BPMTap` will start to send out values on its own after one bar.

### nudgeLeft

To fine-tune the `bpm` value press `nudgeLeft` various times, the `bpm`-value will decrease.

### nudgeRight

To fine-tune the `bpm` value press `nudgeRight` various times, the `bpm`-value will increase.

### sync

If `BPMTap` is out of sync with your music, press `sync` once on the start of a beat to reset the start beat.

## Out Ports

### beat

Triggers on every beat – *1, 2, 3, 4*.

### beat1

Triggers on the first beat – *1, _, _, _*.

### beat2

Triggers on the second beat – *_, 2, _, _*.

### beat3

Triggers on the third beat – *_, _, 3, _*.

### beat4

Triggers on the fourth beat – *_, _, _, 4*.

### offbeat

Triggers on the offbeats – *1 **and** two **and** …*

### bpm

The calculated `bpm`-value, based on you taps.