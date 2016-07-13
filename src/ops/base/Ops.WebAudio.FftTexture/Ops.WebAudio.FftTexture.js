op.name="FftTexture";

var fftArr=this.addInPort(new Port(this, "FFT Array",OP_PORT_TYPE_ARRAY));
var refresh=this.addInPort(new Port(this,"refresh",OP_PORT_TYPE_FUNCTION));

var texOut=op.addOutPort(new Port(op,"texture_out",OP_PORT_TYPE_TEXTURE,{preview:true}));
var position=op.addOutPort(new Port(op,"position",OP_PORT_TYPE_VALUE));

var cgl=op.patch.cgl;
var tex=new CGL.Texture(cgl,{});
var data=[];

var line=0;
var height=256;

var buffer=new Uint8Array();

refresh.onTriggered=function()
{
    var arr=fftArr.get();
    if(!arr)return;
    var width=arr.length;
    if(!width)return;
    
    
    if(data.length===0)
    {
        data.length=width*4;
        buffer=new Uint8Array(width*height*4);
    }
    if(line>=height-1)
    {
        line=0;
    }
    line++;

position.set(line/height);
    
    // if(data.length!=width*4*height)
    // {
    //     
    // }

    
    // data.length=data.length+width*4;
    
    for(var i=0;i<width;i++)
    {
        // console.log(arr[i]);
        
        data[i*4+0]=arr[i];
        data[i*4+1]=arr[i];
        data[i*4+2]=arr[i];
        data[i*4+3]=255;
        
        // data[(4*line*width)+i*4+0]=arr[i];
        // data[(4*line*width)+i*4+1]=arr[i];
        // data[(4*line*width)+i*4+2]=arr[i];
        // data[(4*line*width)+i*4+3]=255;
    }
    // data.length-=width*4;
    buffer.set(data,line*width*4);
    // buffer.copyWithin(width*4,0,width*4*(height-1));
    
    tex.initFromData(buffer,width,height,CGL.Texture.FILTER_LINEAR,CGL.Texture.WRAP_REPEAT);

    texOut.set(tex);
    
};