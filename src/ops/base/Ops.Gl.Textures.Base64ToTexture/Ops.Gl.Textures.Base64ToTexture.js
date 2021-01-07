// inputs
const dataIn = op.inStringEditor("data URI","");


// outputs
const textureOut = op.outTexture("Texture");

dataIn.onChange = () => {
    var image = new Image();
    image.onload=function(e)
    {
        var tex=CGL.Texture.createFromImage(op.patch.cgl,image,{});
        textureOut.set(tex);
    };
    image.src = dataIn.get();
}