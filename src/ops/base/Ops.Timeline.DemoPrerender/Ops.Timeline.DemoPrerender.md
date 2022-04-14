This op records "heavy events", that cause frame drops at runtime (uploading data to gpu/resizing of textures/compiling shaders).
The process prerendering jumps to the timeline-time of those events and renders the state of the patch at that time, so those "heavy events" already happen in the loading/prerendering state and can be visualized with a progress bar

### how to record "heavy events"

0. if the patch/timing changed a log click "clear" to remove all previous recorded events
1. select prerender op, activate "record events" and save the patch
2. reload the patch and wait for the demo play and finish and save the patch
3. "Num Events" should show the number of detected events.
4. it may be necessary to repeat step 2 a few times, until all huge spikes at scene changes in the performance op graph are gone...
5. uncheck "record events" and save patch again




