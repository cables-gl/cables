const
    inDurUnit = op.inSwitch("Duration Unit", ["Seconds", "Frames"], "Seconds"),
    inDur = op.inInt("Duration", 230),
    inFps = op.inInt("FPS", 25),
    inUnits = op.inSwitch("Display Units", ["Seconds", "Frames"], "Seconds"),

    inShowBpm = op.inBool("Show beats"),
    inBpm = op.inInt("BPM", 120),

    inRestrictToFrames = op.inBool("Restrict to frames", true),

    inFrames = op.inBool("Fade in Frames", true),
    outDurs = op.outNumber("Duration Seconds");

inShowBpm.onChange =
inFps.onChange =
    inFrames.onChange =
    inBpm.onChange =
    inUnits.onChange =
    inDurUnit.onChange =
    inDur.onChange = update;

function update()
{
    CABLES.timelineConfig = CABLES.timelineConfig || {};

    let dur = inDur.get();

    if (inDurUnit.get() == "Frames") dur /= inFps.get();

    CABLES.timelineConfig.displayUnits = inUnits.get();
    CABLES.timelineConfig.duration = dur;
    CABLES.timelineConfig.fps = inFps.get();
    CABLES.timelineConfig.bpm = inBpm.get();
    CABLES.timelineConfig.showBeats = inShowBpm.get();

    CABLES.timelineConfig.fadeInFrames = inFrames.get();
    CABLES.timelineConfig.restrictToFrames = inRestrictToFrames.get();

    op.patch.emitEvent("timelineConfigChange", CABLES.timelineConfig);

    outDurs.set(dur);
}
