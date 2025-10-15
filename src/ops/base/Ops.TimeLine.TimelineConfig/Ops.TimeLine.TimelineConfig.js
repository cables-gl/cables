const
    // inDurUnit = op.inSwitch("Duration Unit", ["Seconds", "Frames"], "Seconds"),
    // inDur = op.inInt("Duration", 230),
    inFps = op.inInt("FPS", 30),

    inRestrictToFrames = op.inBool("Restrict to frames", true),

    inFrames = op.inBool("Fade in Frames", true),
    outDurs = op.outNumber("Duration Seconds");

inFps.onChange =
    inFrames.onChange =
    // inDurUnit.onChange =
    // inDur.onChange =
    update;

function update()
{
    CABLES.timelineConfig = CABLES.timelineConfig || {};

    // let dur = inDur.get();

    // if (inDurUnit.get() == "Frames") dur /= inFps.get();

    // CABLES.timelineConfig.duration = dur;

    CABLES.timelineConfig.fps = inFps.get();

    CABLES.timelineConfig.fadeInFrames = inFrames.get();
    CABLES.timelineConfig.restrictToFrames = inRestrictToFrames.get();

    op.patch.emitEvent("timelineConfigChange", CABLES.timelineConfig);

    // outDurs.set(dur);
}
