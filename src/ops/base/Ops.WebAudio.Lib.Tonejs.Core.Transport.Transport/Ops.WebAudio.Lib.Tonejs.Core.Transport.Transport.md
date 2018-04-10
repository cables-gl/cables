Transport for timing musical events. Supports tempo curves and time changes. Unlike browser-based timing (setInterval, requestAnimationFrame) [Tone.Transport](https://tonejs.github.io/docs/#Transport) timing events pass in the exact time of the scheduled event in the argument of the callback function. Pass that time value to the object you're scheduling. 

A single transport is created for you when the library is initialized. 

The transport emits the events: "start", "stop", "pause", and "loop" which are called with the time of that event as the argument.

[Tone.js Reference](https://tonejs.github.io/docs/#Transport)