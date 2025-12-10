const ver = op.outNumber("Major Version", op.patch.cgl.glVersion);

op.onLoaded = function ()
{
    ver.set(op.patch.cgl.glVersion);
};
