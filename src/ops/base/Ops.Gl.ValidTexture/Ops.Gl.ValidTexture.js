 const
    inTex=op.inTexture("Texture"),
    inWhich=op.inSwitch("Default",['Empty','Stripes'],'Empty'),
    outTex=op.outTexture("Result");


let tex=CGL.Texture.getEmptyTexture(op.patch.cgl);

inWhich.onChange=function()
{
    if(inWhich.get()=="Empty")tex=CGL.Texture.getEmptyTexture(op.patch.cgl);
    else tex=CGL.Texture.getTempTexture(op.patch.cgl);
};

inTex.onChange=function()
{
    let t=inTex.get();

    if(!t) t=tex;

    outTex.set(t);
};