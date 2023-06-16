const
    inMpResult = op.inObject("Hands Result"),
    inWhichHand = op.inSwitch("Hand", ["Left", "Right"], "Left"),
    inMinScore = op.inFloatSlider("Min Score", 0.2),
    outPoints = op.outArray("Points"),
    outLines = op.outArray("Lines"),
    outResult = op.outObject("Data"),
    outFound = op.outBoolNum("Found Hand"),
    outScore = op.outNumber("Score");

function getLines(points)
{
    const lines = [];
    lines.push(points[0 * 3 + 0], points[0 * 3 + 1], points[0 * 3 + 2]); // thumb
    lines.push(points[1 * 3 + 0], points[1 * 3 + 1], points[1 * 3 + 2]);
    lines.push(points[1 * 3 + 0], points[1 * 3 + 1], points[1 * 3 + 2]);
    lines.push(points[2 * 3 + 0], points[2 * 3 + 1], points[2 * 3 + 2]);
    lines.push(points[2 * 3 + 0], points[2 * 3 + 1], points[2 * 3 + 2]);
    lines.push(points[3 * 3 + 0], points[3 * 3 + 1], points[3 * 3 + 2]);
    lines.push(points[3 * 3 + 0], points[3 * 3 + 1], points[3 * 3 + 2]);
    lines.push(points[4 * 3 + 0], points[4 * 3 + 1], points[4 * 3 + 2]);

    lines.push(points[0 * 3 + 0], points[0 * 3 + 1], points[0 * 3 + 2]); // wrist
    lines.push(points[5 * 3 + 0], points[5 * 3 + 1], points[5 * 3 + 2]);
    lines.push(points[5 * 3 + 0], points[5 * 3 + 1], points[5 * 3 + 2]);
    lines.push(points[9 * 3 + 0], points[9 * 3 + 1], points[9 * 3 + 2]);
    lines.push(points[9 * 3 + 0], points[9 * 3 + 1], points[9 * 3 + 2]);
    lines.push(points[13 * 3 + 0], points[13 * 3 + 1], points[13 * 3 + 2]);
    lines.push(points[13 * 3 + 0], points[13 * 3 + 1], points[13 * 3 + 2]);
    lines.push(points[17 * 3 + 0], points[17 * 3 + 1], points[17 * 3 + 2]);
    lines.push(points[17 * 3 + 0], points[17 * 3 + 1], points[17 * 3 + 2]);
    lines.push(points[0 * 3 + 0], points[0 * 3 + 1], points[0 * 3 + 2]);

    lines.push(points[5 * 3 + 0], points[5 * 3 + 1], points[5 * 3 + 2]); // index finger
    lines.push(points[6 * 3 + 0], points[6 * 3 + 1], points[6 * 3 + 2]);
    lines.push(points[6 * 3 + 0], points[6 * 3 + 1], points[6 * 3 + 2]);
    lines.push(points[7 * 3 + 0], points[7 * 3 + 1], points[7 * 3 + 2]);
    lines.push(points[7 * 3 + 0], points[7 * 3 + 1], points[7 * 3 + 2]);
    lines.push(points[8 * 3 + 0], points[8 * 3 + 1], points[8 * 3 + 2]);

    lines.push(points[9 * 3 + 0], points[9 * 3 + 1], points[9 * 3 + 2]); // middle finger
    lines.push(points[10 * 3 + 0], points[10 * 3 + 1], points[10 * 3 + 2]);
    lines.push(points[10 * 3 + 0], points[10 * 3 + 1], points[10 * 3 + 2]);
    lines.push(points[11 * 3 + 0], points[11 * 3 + 1], points[11 * 3 + 2]);
    lines.push(points[11 * 3 + 0], points[11 * 3 + 1], points[11 * 3 + 2]);
    lines.push(points[12 * 3 + 0], points[12 * 3 + 1], points[12 * 3 + 2]);

    lines.push(points[13 * 3 + 0], points[13 * 3 + 1], points[13 * 3 + 2]); // ring finger
    lines.push(points[14 * 3 + 0], points[14 * 3 + 1], points[14 * 3 + 2]);
    lines.push(points[14 * 3 + 0], points[14 * 3 + 1], points[14 * 3 + 2]);
    lines.push(points[15 * 3 + 0], points[15 * 3 + 1], points[15 * 3 + 2]);
    lines.push(points[15 * 3 + 0], points[15 * 3 + 1], points[15 * 3 + 2]);
    lines.push(points[16 * 3 + 0], points[16 * 3 + 1], points[16 * 3 + 2]);

    lines.push(points[17 * 3 + 0], points[17 * 3 + 1], points[17 * 3 + 2]); // ring finger
    lines.push(points[18 * 3 + 0], points[18 * 3 + 1], points[18 * 3 + 2]);
    lines.push(points[18 * 3 + 0], points[18 * 3 + 1], points[18 * 3 + 2]);
    lines.push(points[19 * 3 + 0], points[19 * 3 + 1], points[19 * 3 + 2]);
    lines.push(points[19 * 3 + 0], points[19 * 3 + 1], points[19 * 3 + 2]);
    lines.push(points[20 * 3 + 0], points[20 * 3 + 1], points[20 * 3 + 2]);

    return lines;
}

inMpResult.onChange = () =>
{
    let points = [];
    let points2 = [];
    let lines = null;
    let lines2 = null;
    let r = inMpResult.get();

    if (r && r.multiHandedness)
    {

    }
    else
    {
        outFound.set(false);
        outScore.set(0);
        return;
    }

    let idx = 0;

    let found = false;

    if (r.multiHandedness)
    {
        for (let i = 0; i < r.multiHandedness.length; i++)
        {
            if (r.multiHandedness[i].label == inWhichHand.get())
            {
                idx = i;
                outScore.set(r.multiHandedness[i].score);
                found = true;
            }
        }
    }

    if (found && outScore.get() > inMinScore.get())
    {
        outFound.set(true);
        if (r && r.multiHandLandmarks && r.multiHandLandmarks[idx])
        {
            for (let i = 0; i < r.multiHandLandmarks[idx].length; i++)
            {
                points[i * 3] = (r.multiHandLandmarks[idx][i].x - 0.5) * 2;
                points[i * 3 + 1] = -1 * (r.multiHandLandmarks[idx][i].y - 0.5) * 2;
                points[i * 3 + 2] = 0;
            }
            lines = getLines(points);

            outPoints.set(points);
            outLines.set(lines);
            outResult.set(r.multiHandLandmarks[idx]);
        }
    }
    else
    {
        outResult.set(null);
        outPoints.set(null);
        outLines.set(null);

        outFound.set(false);
    }
};
