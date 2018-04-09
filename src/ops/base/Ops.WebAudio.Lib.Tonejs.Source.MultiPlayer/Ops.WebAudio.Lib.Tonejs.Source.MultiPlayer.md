MultiPlayer is well suited for one-shots, multi-sampled instruments or any time you need to play a bunch of audio buffers. It has eight ports to which you can connect an `AudioBuffer` – which holds your sample (wav / mp3 / ogg). It also brings some options to change the pitch of each sample, or set its duration.

For every action (`Start Buffer` / `Start Buffer (Loop)` / `Stop Buffer` / `Stop All Buffers` ) you can specify the `Time` – `+0` means *right now*. By putting in a bigger number you can schedule things in the future, e.g. starting a sample with `Time` = `+3` will start the playback in three seconds. 

**Important: **When you trigger `Start Buffer` / `Start Buffer (Loop)` / `Stop Buffer` you also need to specify the `Buffer Index` – so which of the buffers you want to start / stop. By default this is `0`, so the first buffer will be used (`Audio Buffer 0`).

[Tone.js Reference](https://tonejs.github.io/docs/#MultiPlayer)