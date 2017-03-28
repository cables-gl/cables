# Transport

*Ops.WebAudio.Lib.Tonejs.Core.Transport.Transport*   

Transport for timing musical events. Supports tempo curves and time changes. Unlike browser-based timing (setInterval, requestAnimationFrame) [Tone.Transport](https://tonejs.github.io/docs/#Transport) timing events pass in the exact time of the scheduled event in the argument of the callback function. Pass that time value to the object you're scheduling. 

A single transport is created for you when the library is initialized. 

The transport emits the events: "start", "stop", "pause", and "loop" which are called with the time of that event as the argument.

[Tone.js Reference](https://tonejs.github.io/docs/#Transport)

## Input

### BPM [Number]

The Beats Per Minute of the Transport.

### Swing [Number]

The swing value. Between 0-1 where 1 equal to the note + half the subdivision.

### Swing Subdivision [Number]

Set the subdivision which the swing will be applied to. The default value is an 8th note. Value must be less than a quarter note.

### Time Division [Number]

### Loop [Bool]

If the transport loops or not.

### Loop Start [Number]

When `Loop` = true, this is the starting position of the loop.

### Loop End [Number]

When `Loop` = false, this is the starting position of the loop.

### Pulses Per Quarter Note [Number]

Pulses Per Quarter note. This is the smallest resolution the Transport timing supports. Do not change this if you don’t know what you are doing.

### Start [Function]

Start the transport and all sources synced to the transport.

### Start Time [String]

When the transport should start once `Start` was triggered

### Start Offset [String]

The offset to start from

### Auto Start [Bool]

If set `Transport` will automatically start when the patch was loaded, or the `Update`-port was connected.

### Stop [Function]

Stop the transport and all sources synced to the transport.

### Stop Time [String]

## Output

### State [String]

Either `started` or `stopped`

### Position [String]

The current (virtual) timeline-position. Format: Bars:Beats:Sixteenth

### Seconds

The current position in seconds

### Progress [Number]

The currrent progress from `0` to `1`

### Ticks

The current position in ticks