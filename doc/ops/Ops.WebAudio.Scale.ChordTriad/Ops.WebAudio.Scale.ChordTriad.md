# ChordTriad

*Ops.WebAudio.Scale.ChordTriad.js*  

Creates a chord (triad) based on a scale and the base tone. Works with major and minor chords. The constructed chord has the base tone, two tones above the base tone, and 4 tones above, e.g. `[C3, E3, G3]` in `C3, D3, E3, F3, G3, A3, B3, C4` . As a scale input you can use the `ScaleArray`-op.

Make sure `Include High Base Tone` in the `ScaleArray`-op is not checked, or the chord will be wrong.

## Input

### Scale [Array]

Connect this to a `Scale-Array`-op, which has `Append Octave` checked

### Base Note [String]

The note you want to get the chord from, e.g. `C4`

## Output

### Chord [Array]

The triad chord for the base tone in the scale, e.g. `["C3", "E3", "G3"]`