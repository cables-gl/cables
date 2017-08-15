op.name="ArrayTextureLoader";

var inUrls=op.addInPort(new Port(op,"URLs",OP_PORT_TYPE_ARRAY));
var outTextures=op.addOutPort(new Port(op,"Textures",OP_PORT_TYPE_ARRAY));

var texArr=[];

function loadTexture(url)
{
    if(!url)return;
    var loadingId=op.patch.loading.start('array texture loader',''+url);

    var tex=CGL.Texture.load(op.patch.cgl,url,
        function(err)
        {
            op.patch.loading.finished(loadingId);

            if(err)
            {
                console.log('could not load texture ',url);
                return;
            }

        },
        {
            wrap:CGL.Texture.WRAP_CLAMP_TO_EDGE,
            filter:CGL.Texture.FILTER_MIPMAP,
            flip:false
        });
    return tex;
}


inUrls.onValueChanged=function()
{
    if(!inUrls.get())return;

    var urls=inUrls.get();


console.log('arraytextureloader',urls.length);
    texArr.length=0;
    for(var i in urls)
    {
        // console.log('load ',urls[i]);
        texArr.push( loadTexture( urls[i] ) );
    }
    outTextures.set(texArr);
    
};
