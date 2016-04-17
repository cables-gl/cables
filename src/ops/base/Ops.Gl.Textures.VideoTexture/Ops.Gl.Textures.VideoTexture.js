op.name='VideoTexture';

var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string' } ));

var textureOut=op.addOutPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));

var cgl=op.patch.cgl;
var videoElement=document.createElement('video');
var intervalID=null;

var tex=new CGL.Texture(cgl);
tex.setSize(1280,720);
textureOut.set(tex);

function updateTexture()
{
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex.tex);
    // cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, true);
    cgl.gl.texImage2D(cgl.gl.TEXTURE_2D, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, videoElement);
    // cgl.gl.texParameteri(cgl.gl.TEXTURE_2D, cgl.gl.TEXTURE_MAG_FILTER, cgl.gl.LINEAR);
    // cgl.gl.texParameteri(cgl.gl.TEXTURE_2D, cgl.gl.TEXTURE_MIN_FILTER, cgl.gl.LINEAR_MIPMAP_NEAREST);
    // cgl.gl.generateMipmap(cgl.gl.TEXTURE_2D);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);
}

function startVideo()
{
  videoElement.play();
  videoElement.muted = true;
  videoElement.loop = true;
  if(!intervalID)intervalID = setInterval(updateTexture, 15);

}

function reload(nocache)
{
    videoElement.setAttribute('src',filename.get());
    videoElement.addEventListener("canplaythrough", startVideo, true);
}

filename.onValueChange(reload);

