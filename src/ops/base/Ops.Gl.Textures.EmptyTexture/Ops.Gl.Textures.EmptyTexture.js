const width=op.inValue("width",8);
const height=op.inValue("height",8);
const textureOut=op.outTexture("texture");

const cgl=op.patch.cgl;
const tex=new CGL.Texture(cgl);

width.onChange=sizeChanged;
height.onChange=sizeChanged;

sizeChanged();

function sizeChanged()
{
    tex.setSize(width.get(),height.get());
    textureOut.set( tex );
}