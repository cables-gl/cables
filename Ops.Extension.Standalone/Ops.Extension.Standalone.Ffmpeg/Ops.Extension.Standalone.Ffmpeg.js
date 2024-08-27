// https://www.npmjs.com/package/fluent-ffmpeg

const ffmpeg = op.require("fluent-ffmpeg");

const
    inFile = op.inUrl("Source Video"),
    inOutFile = op.inString("Destination File", "/Users/tom/output.mp4"),

    inAudio = op.inSwitch("Audio", ["No Change", "Remove"], "No Change"),

    inBitrate = op.inBool("Set Bitrate", false),
    inBitrateStr = op.inString("Bitrate", "1000k"),
    inBitrateConst = op.inBool("Constant", false),

    inCodec = op.inBool("Set Codec", false),
    inCodecStr = op.inString("Codec", "libx264"),

    inSize = op.inBool("Set Size", false),
    inSizeStr = op.inString("Size", "640x480"),

    inTime = op.inBool("Crop Time", false),
    inTimeStart = op.inString("Start time", "0"),
    inTimeDur = op.inString("Duration", "3"),

    exec = op.inTriggerButton("Process"),
    outBusy = op.outBoolNum("Processing");

op.setPortGroup("Timing", [inTime, inTimeStart, inTimeDur]);
op.setPortGroup("Size", [inSizeStr, inSize]);
op.setPortGroup("Video Codec", [inCodecStr, inCodec]);
op.setPortGroup("Video Bitrate", [inBitrate, inBitrateConst, inBitrateStr]);

let loadingId = null;

if (ffmpeg)
{
    inTime.onChange =
    inBitrate.onChange =
    inCodec.onChange =
    inSize.onChange = updateUi;
}

updateUi();

function updateUi()
{
    inTimeStart.setUiAttribs({ "greyout": !inTime.get() });
    inTimeDur.setUiAttribs({ "greyout": !inTime.get() });

    inSizeStr.setUiAttribs({ "greyout": !inSize.get() });
    inCodecStr.setUiAttribs({ "greyout": !inCodec.get() });

    inBitrateConst.setUiAttribs({ "greyout": !inBitrate.get() });
    inBitrateStr.setUiAttribs({ "greyout": !inBitrate.get() });
}

if (ffmpeg)
    exec.onTriggered = () =>
    {
        op.setUiError("exc", null);

        outBusy.set(true);
        let fn = inFile.get();
        fn = fn.replaceAll("%20", " ");

        loadingId = op.patch.loading.start(op.objName, fn, op);

        try
        {
            let ff = ffmpeg();

            ff.on("end", () =>
            {
                outBusy.set(false);
                loadingId = op.patch.loading.finished(loadingId);
            });

            ff.on("error", (err) =>
            {
                op.setUiError("exc", err);
                op.log("err", err);
                loadingId = op.patch.loading.finished(loadingId);
            });

            ff.input(inFile.get());

            if (inBitrate.get())
                ff.videoBitrate(inBitrateStr.get(), inBitrateConst.get() == 1);

            if (inAudio.get() == "Remove")
                ff.noAudio();

            if (inCodec.get())
                ff.videoCodec(inCodecStr.get());

            if (inSize.get())
                ff.size(inSizeStr.get());

            if (inTime.get())
            {
                ff.seekInput(inTimeStart.get());
                ff.duration(inTimeDur.get());
            }

            ff.output(inOutFile.get());

            ff.run();
        }
        catch (e)
        {
            op.setUiError("exc", e.message);
            loadingId = op.patch.loading.finished(loadingId);
        }
    };
