const outFPS=op.outValue("FPS");

var iv=setInterval(function()
{
    outFPS.set(op.patch.getFPS());
},500);

op.onDelete=function()
{
    clearInterval(iv);
};