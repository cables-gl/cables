
op.name='empty texture';

var width=op.inValue("width");
var height=op.inValue("height");

var textureOut=op.outTexture("texture");

var cgl=op.patch.cgl;
var tex=new CGL.Texture(cgl);


var sizeChanged=function()
{
    tex.setSize(width.get(),height.get());
    textureOut.set( tex );
};

width.onChange=sizeChanged;
height.onChange=sizeChanged;

width.set(8);
height.set(8);
