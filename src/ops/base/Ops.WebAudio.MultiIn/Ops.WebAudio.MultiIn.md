# MultiIn

*Ops.WebAudio.MultiIn*

Connector-op, which makes it possible to combine multiple audio signals into one. If you want to control the gain of each individual audio signal use `Gain`-ops before.

## Ports

### Input

#### audio in 0-8

Multiple audio input ports, e.g. coming from an `Oscillator`-op.

### Output

#### audio out

Audio output which contains the mixed audio signal of all connected inputs, can be connected to `AudioOutput` e.g..