# BarsBeatsSixteenthResolver

*Ops.WebAudio.Lib.Tonejs.Type.BarsBeatsSixteenthResolver*  

This op is useful in combination with the `Transport`-op. It has a `Position (BarsBeatsSixteenth)` output port, which outputs the current position on the (virtual) timeline, e.g. `17:2:3`. To make use of these values, e.g. to trigger certain things on the timeline `BarsBeatsSixteenthResolver` can be used.

Explanation of Bars, Beats and Sixteenth: [apronus.com](http://www.apronus.com/music/lessons/unit02.htm)

## Inputs

## Bars:Beats:Sixteenth [String]

A string in the form Bars:Beats:Siyteenth, e.g. `14:3:2`. Mostly you will connect this to the `Position (BarsBeatsSixteenth)`-port of the `Transport`-op.

## Outputs

### Bars [Number]

In which bar the timeline is at right now

### Beats [Number]

In which beat of the current bar the timeline is at right now. In 4/4 music one bar consist of 4 beats.

### Sixteenth [Number]

In which sixteenth of the current beat the timeline is at right now. In 4/4 music one beat consist of 4 sixteenth.

### Sixteenth (Precise) [Number]

Same as the `Sixteenth`-port, but more precise