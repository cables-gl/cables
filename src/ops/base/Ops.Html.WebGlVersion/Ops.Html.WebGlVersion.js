var ver=op.outValue("Major Version",op.patch.cgl.glVersion);

op.onLoaded=function()
{
    ver.set(op.patch.cgl.glVersion);
};


