const
    inActive = op.inBool("Active", true),
    next = op.outTrigger("Next"),
    outDelta = op.outNumber("Delta"),
    outTime = op.outNumber("Time"),
    outFrame = op.outNumber("Frame");

const MS_PER_SECOND = 1000;

outDelta.ignoreValueSerialize = true;
outTime.ignoreValueSerialize = true;
outFrame.ignoreValueSerialize = true;

op.onAnimFrame = function (tt, frameNum, deltaMs)
{
    if (!inActive.get()) return;

    outDelta.set(deltaMs / MS_PER_SECOND);
    outTime.set(tt);
    outFrame.set(frameNum);
    next.trigger();
};

op.onDelete = () =>
{
    op.patch.removeOnAnimFrame(op);
};
