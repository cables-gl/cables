op.name="FftTexture";

var refresh=this.addInPort(new Port(this,"refresh",OP_PORT_TYPE_FUNCTION));
var fftArr=this.addInPort(new Port(this, "FFT Array",OP_PORT_TYPE_ARRAY));

// var inHeight=op.inValueSelect("Height",[128,256,512,1024,2048],128);

var texOut=op.outTexture("texture_out");

var position=op.addOutPort(new Port(op,"position",OP_PORT_TYPE_VALUE));

var cgl=op.patch.cgl;
var tex=new CGL.Texture(cgl,
    {
        "wrap":CGL.Texture.CLAMP_TO_EDGE
    });

var data=[];

var line=0;
var height=256;

var buffer=new Uint8Array();

// inHeight.onChange=function()
// {
//     height=parseInt(inHeight.get(),10);
//     data.length=0;
//     line=0;
// };

refresh.onTriggered=function()
{
    var arr=fftArr.get();
    if(!arr)return;
    var width=arr.length;
    // var height=width;
    if(!width)return;
    

    if(data.length===0 || data.length!=width*4)
    {
        // console.log(width*height*4);
        
        data.length=width*4;
        buffer=new Uint8Array(width*height*4);
    }
    line++;
    if(line>=height)
    {
        line=0;
    }
    
    

    position.set(line/height);
    
    for(var i=0;i<width;i++)
    {
        data[i*4+0]=arr[i];
        data[i*4+1]=arr[i];
        data[i*4+2]=arr[i];
        data[i*4+3]=255;
    }

    buffer.set(data,line*width*4);

// console.log(        width,height);

    if(tex.width!=width || tex.height!=height)
    {
        tex.setSize(width,height);
        console.log('fft texture size',width,height);
    }
    
    tex.initFromData(
        buffer,
        width,
        height,
        CGL.Texture.FILTER_LINEAR,
        CGL.Texture.CLAMP_TO_EDGE);

    texOut.set(tex);
};

