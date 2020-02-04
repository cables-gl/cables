const
    inArr=op.inArray("Array"),

    wrap=op.inValueSelect("wrap",['repeat','mirrored repeat','clamp to edge'],'repeat'),
    tfilter=op.inSwitch("filter",['nearest','linear','mipmap'],'mipmap'),

    outTex=op.outTexture("Texture");

inArr.onChange=update;
const cgl=op.patch.cgl;

var tex=new CGL.Texture(cgl,{wrap:CGL.Texture.WRAP_REPEAT});
var pixels=new Uint8Array(10);

var cgl_filter=CGL.Texture.FILTER_MIPMAP;
var cgl_wrap=CGL.Texture.WRAP_REPEAT;

tfilter.onChange=onFilterChange;
wrap.onChange=onFilterChange;


function onFilterChange()
{
    if(tfilter.get()=='nearest') cgl_filter=CGL.Texture.FILTER_NEAREST;
    else if(tfilter.get()=='linear') cgl_filter=CGL.Texture.FILTER_LINEAR;
    else if(tfilter.get()=='mipmap') cgl_filter=CGL.Texture.FILTER_MIPMAP;

    if(wrap.get()=='repeat') cgl_wrap=CGL.Texture.WRAP_REPEAT;
    else if(wrap.get()=='mirrored repeat') cgl_wrap=CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if(wrap.get()=='clamp to edge') cgl_wrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;

    update();
}



function update()
{
    var arr=inArr.get();
    if(!arr)
    {
        outTex.set(CGL.Texture.getEmptyTexture(cgl));
        return;
    }

    var width=Math.ceil(Math.sqrt(arr.length/3));
    var height=Math.ceil(arr.length/3/width);

    if(width<1)width=1;
    if(height<1)height=1;

    if(tex.width!=width || height!=tex.height)
    {
        tex.delete();
        tex=new CGL.Texture(cgl,{"width":width,"height":height,"filter":cgl_filter,"wrap":cgl_wrap});
    }

    const num=width*4*height;
    if(pixels.length!=num)pixels=new Uint8Array(num);

    var i=0,j=0;
    var idx=0;

    for(j=0;j<width*height;j++)
    {
        idx++;
        var idxa=idx;
        if(idx*3>arr.length-1)idxa=0;
        pixels[idx*4+0]=(arr[idxa*3+0]+0.)*255;
        pixels[idx*4+1]=(arr[idxa*3+1]+0.)*255;
        pixels[idx*4+2]=(arr[idxa*3+2]+0.)*255;
        pixels[idx*4+3]=255;
    }

    tex.initFromData(pixels,width,height,cgl_filter,cgl_wrap);

    outTex.set(null);
    outTex.set(tex);
}
