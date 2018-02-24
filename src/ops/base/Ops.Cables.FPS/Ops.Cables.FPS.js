var outFPS=op.outValue("FPS");

var iv=setInterval(function()
{
    outFPS.set(op.patch.getFPS());
});

op.onDelete=function()
{
    clearInterval(iv);
    
};