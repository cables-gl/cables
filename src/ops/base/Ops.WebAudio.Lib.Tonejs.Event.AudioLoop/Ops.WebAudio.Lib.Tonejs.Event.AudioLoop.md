# AudioLoop

*Ops.WebAudio.Lib.Tonejs.Event.AudioLoop*  

Creates a looped callback at the specified interval. This can e.g. be used to play notes in other ops. The callback can be started, stopped and scheduled along the Transport's timeline. Every time the event happens, the output-port `Time` will be set and `Trigger` will be triggered.

## Input

### Update State Ports [Function]

Updates the output-ports `Started` and `Progress`. This is handy to find out if the loop is playing, connect it e.g. to `MainLoop`. As this is not very performant, it is best to not connect this port when you don’t need access to `State` and `Progress`.

## Interval [Time]

How often the event happens. See [Tone.js Time Docs](https://github.com/Tonejs/Tone.js/wiki/Time)

### Iterations [Number]

How oftne the loop should be repeated. If set to `0` it will go on infinitely.

### Playback rate [Number]

How fast the loop should be. `1` is default, `2` is double the speed and so on.

### Humanize [Bool]

Adds a random variation to the scheduled time, so it is a bit more human (inprecise). If set `Humanize Time` will be used.

### Humanize Time [Time]

If `Humanize` is set to true, a random variation to the scheduled time is added / subtracted, so it is a bit more human (inprecise).

### Probability [Number]

The probably of the callback being invoked. `1` = all callbacks, `0` = no callbacks at all

### Start Time [Time]

When along the timeline the loop should start. `0` means at the beginning.

### Start [Function]

Starts the loop at `Start Time`

### Stop Time [Time]

When along the timeline the loop should stop. `+0` means *right now*

### Start [Function]

Stops the loop at `Stop Time`

### Cancel Time [Time]

The time after which events will be cancel. `+0` means *right now*

### Cancel [Function]

Cancel all scheduled events greater than or equal to the `Cancel Time`.

## Output

### Trigger [Function]

Triggers every time the loop has an event

### Event Time [Time]

The time the event occurs

### Started [Bool]

`true` when the loop is currently playing, `false` otherwise. For this value to update you need to connect `Update Stare Ports` e.g. to ´MainLoop´.

### Progress [Number]

The current progress in the loop, `0` = *at the beginning*, `1` = *at the end*. For this value to update you need to connect `Update State Ports` e.g. to ´MainLoop´.