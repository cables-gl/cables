This op is able to output a midi clock signal as triggers. It also outputs different musical subdivisions as trigger, ranging from a full note (one bar) to a sixteenth note.

Furthermore you can change the timing of the subdivions to either dotted notes or triplets (e.g. the 1/16 - note becomes a 1/16-note-triplet). 

It is also possible to read the current bpm and tick duration from MidiClock.

The subtick output is a counter that goes from 0 - 24 and then resets. In MIDI, a quarter note is represented by 24 clock ticks.

