const outTex=op.outTexture("Texture");

const cgl=op.patch.cgl;
const size=256;

const temptex=new CGL.Texture(cgl);
const data = new Uint8Array(size*size*4);

for(var x=0;x<size*size;x++)
{
    data[ x*4+0]=Math.random()*255;
    data[ x*4+1]=Math.random()*255;
    data[ x*4+2]=Math.random()*255;
    data[ x*4+3]=255;
}

temptex.initFromData(data,size,size,CGL.Texture.FILTER_NEAREST,CGL.Texture.WRAP_REPEAT);

outTex.set(temptex);