# How to optimize cables patches with the Performance op

So, how can we use the performance op and Flow mode to find potential bottlenecks and optimize our patch?
If you find yourself with a patch that feels slow or is stuttering, try the following procedure:

First, plug in a [Performance](https://cables.gl/op/Ops.Gl.Performance) op right after your [MainLoop](https://cables.gl/op/Ops.Gl.MainLoop). As explained before, you should now see various metrics in the top left corner of your canvas. Keep an eye on the values **FPS** and **frame avg** (frame average).

If you have a patch that is slow, you should start by disconnecting your ops from top to bottom. Keep an eye on these two while you continue with the following steps:

1. Disconnect the trigger below the Performance op. Your FPS and frame average should now go back to 60 (fps) and a frame average below **1ms**.
2. Now reconnect everything and check if these values go up again.
3. You now know that something after your Performance op impacts the performance of your patch.
4. Now try disconnecting different branches below the Performance op and see if there is an increase in performance.
5. If not, go further down the chain and disconnect the ops/branches even further below.
6. Repeat 4) and 5) until you can pinpoint which part of your patch is responsible for impacting your performance.
