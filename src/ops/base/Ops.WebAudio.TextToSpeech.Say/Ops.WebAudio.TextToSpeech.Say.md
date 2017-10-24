# Say

*Ops.WebAudio.TextToSpeech.Say*

Text-to-Speech, says things with synthethic voice. Enter some text to `Text` and trigger the `Say`-port.

## Input

### Update State (Function)

Updates the output-parameters (`Speaking`, `Pending`, `Paused`). There is no need to connect this if you don’t use them.

### Text (String)

The text which should be said. If `Say On Text Change` is set to `true`, every time you change the text it will be said.

### Say (Function)

Sais text, the most important port of this op.

### Voice (String)

There are multiple voices to choose from. These may vary depending on your browser.

### Pitch (Number)

The pitch (how high / low), in range `[0..2]`, will be actived the next time you call `Say`.

### Volume (Number)

How loud, in range `[0..1]`

### Say On Text Change (Bool)

If set every time you change the text it will be said

### Pause (Function)

Paused saying things

### Resume (Function)

Resumes saying things after a pause

### Cancel (Function)

Cancels the queue, if you trigger `Say` too often, this might come in handy.

## Output

### Next (Function)

Triggers the next op.

### Speaking

`true` when the voice is currently speaking. You need to connect `Update State` to e.g. `MainLoop` for this to be updated.

### Pending

`true` when the last say command (the last text) is waiting in line. You need to connect `Update State` to e.g. `MainLoop` for this to be updated.

### Paused

`true` when the voice is currently paused. You need to connect `Update State` to e.g. `MainLoop` for this to be updated.

## Example

- [Text-to-Speech Example](https://cables.gl/p/59b1356a12401c551fe7ebe6)