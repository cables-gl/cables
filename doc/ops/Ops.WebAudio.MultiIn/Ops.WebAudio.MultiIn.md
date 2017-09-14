# MultiIn

*Ops.WebAudio.MultiIn*

Connector-op, which makes it possible to combine multiple audio signals into one. If you want to control the gain of each individual audio signal use `Gain`-ops before.

## Input

### Audio in 0-8

*Type: Object*   
Multiple audio input ports, e.g. coming from an `Oscillator`-op.

## Output

### Audio Out

*Type: Object*   
Audio output which contains the mixed audio signal of all connected inputs, can be connected to `AudioOutput` e.g..