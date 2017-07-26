op.name="resizetest";

var cgl=op.patch.cgl;

op.patch.cgl.addEventListener('resize',function()
{

   console.log('resize!',cgl.canvasWidth,cgl.canvasHeight);

});

