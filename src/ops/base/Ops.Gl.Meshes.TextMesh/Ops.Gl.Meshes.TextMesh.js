
op.name='TextMesh';

var render=op.inFunction("Render");
var textureOut=op.outTexture("texture");
var scale=op.inValue("Scale",10);
var str=op.inValueString("Text","cables");
var cgl=op.patch.cgl;

var textureSize=2048;

var fontImage = document.createElement('canvas');
fontImage.id = "texturetext_"+CABLES.generateUUID();
fontImage.style.display = "none";
var body = document.getElementsByTagName("body")[0];
body.appendChild(fontImage);

str.onChange=generateMesh;

var ctx = fontImage.getContext('2d');
var chars={};

var cgl=op.patch.cgl;

var mesh=null;
var transformations=[];


var srcFrag=''
    .endl()+'precision mediump float;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'varying vec2 texCoord;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    .endl()+'   col.a=col.r;'
    .endl()+'   gl_FragColor=col;'
    .endl()+'}'
    .endl();

var srcVert=''
    .endl()+'precision mediump float;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 modelMatrix;'
    .endl()+'uniform mat4 viewMatrix;'
    .endl()+'uniform float scale;'
    .endl()+'attribute vec3 vPosition;'
    .endl()+'attribute vec2 attrTexCoord;'
    .endl()+'attribute mat4 instMat;'
    .endl()+'attribute vec2 attrTexOffsets;'
    .endl()+'attribute vec2 attrTexSize;'

    .endl()+'varying vec2 texCoord;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   texCoord=(attrTexCoord*(attrTexSize)) + attrTexOffsets;'
    .endl()+'   mat4 instModelMat=instMat;'
    .endl()+'   instModelMat[3][0]*=scale;'

    .endl()+'   mat4 mvMatrix=viewMatrix * modelMatrix * instModelMat;'
    .endl()+'   vec4 vert=vec4( vPosition.x*attrTexSize.x*scale,vPosition.y*attrTexSize.y*scale,vPosition.z*scale, 1. );'

    .endl()+'   gl_Position = projMatrix * mvMatrix * vert;'
    .endl()+'}'
    .endl();


var shader=new CGL.Shader(cgl,'TextMesh');
shader.setSource(srcVert,srcFrag);
var uniTex=new CGL.Uniform(shader,'t','tex',0);
var uniScale=new CGL.Uniform(shader,'f','scale',scale);

render.onTriggered=function()
{
    if(!textureOut.get()) generateTexture();
    if(!mesh)generateMesh();

    cgl.gl.blendFunc(cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.setShader(shader);

    // cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, textureOut.get().tex);
    cgl.setTexture(0,textureOut.get().tex);

    mesh.render(cgl.getShader());
    
    cgl.setTexture(0,null);



    cgl.setPreviousShader();
    // mesh.unBind(shader);
    
    cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);
};



function generateMesh()
{
    if(!textureOut.get())return;
    if(!mesh)
    {
        var geom=new CGL.Geometry();
        
        geom.vertices = [
             1.0,  1.0,  0.0,
            -0.0,  1.0,  0.0,
             1.0, -0.0,  0.0,
            -0.0, -0.0,  0.0
        ];
        
        geom.texCoords = [
             1.0, 1.0,
             0.0, 1.0,
             1.0, 0.0,
             0.0, 0.0
        ];
        
        geom.verticesIndices = [
            0, 1, 2,
            3, 1, 2
        ];
        
        mesh=new CGL.Mesh(cgl,geom);
    }

    var numChars=str.get().length;
    var m=mat4.create();
    var txt=str.get();
    var tcOffsets=[];
    var tcSize=[];
    var pos=0;
    
    for(var i=0;i<numChars;i++)
    {
        var chStr=txt.substring(i,i+1);

        tcOffsets[i*2+0]=chars[chStr].texCoordX;
        tcOffsets[i*2+1]=1-chars[chStr].texCoordY-chars[chStr].texCoordHeight;

        tcSize[i*2+0]=chars[chStr].texCoordWidth;
        tcSize[i*2+1]=chars[chStr].texCoordHeight;

        mat4.identity(m);
        mat4.translate(m,m,[pos,0,0]);
        pos+=chars[chStr].texCoordWidth;
        transformations[i]=Array.prototype.slice.call(m);
    }
    
    var arrs = [].concat.apply([], transformations);
    var matrices = new Float32Array(arrs);
    
    mesh.numInstances=numChars;
    mesh.setAttribute('instMat',matrices,16,{"instanced":true});
    mesh.setAttribute('attrTexOffsets',tcOffsets,2,{"instanced":true});
    mesh.setAttribute('attrTexSize',tcSize,2,{"instanced":true});

}

function generateTexture()
{
    if(!textureOut.get()) textureOut.set(new CGL.Texture.fromImage(cgl,fontImage,CGL.Texture.FILTER_MIPMAP));
    
    textureOut.get().setSize(textureSize,textureSize);
    ctx.canvas.width=fontImage.width=ctx.canvas.height=fontImage.height=textureSize;

    ctx.clearRect(0,0,fontImage.width,fontImage.height);

    ctx.fillStyle = 'rgba(255,255,255,255)';
    var fontSize=200;
    ctx.font = fontSize+'px Arial';
    ctx.textAlign = "left";

    var txt='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789,./-[]{};()!?@#$%^&*_+öäüÖÄÜ';
    var posy=0,i=0;
    var posx=0;
    var lineHeight=fontSize*1.4;

    for(i=0;i<txt.length;i++)
    {
        var chStr=txt.substring(i,i+1);
        var chWidth=Math.round(ctx.measureText(chStr).width);

        if(posx+chWidth>=textureSize)
        {
            posy+=lineHeight+2;
            posx=0;
        }

        chars[chStr]=
            {
                str:chStr,
                texCoordX:posx/textureSize,
                texCoordY:posy/textureSize,
                texCoordWidth:chWidth/textureSize,
                texCoordHeight:lineHeight/textureSize,
            };

        ctx.fillStyle = 'transparent';
        ctx.fillRect(posx,posy,chWidth,lineHeight);
        
        ctx.fillStyle = 'white';
        ctx.fillText(chStr, posx, posy+fontSize);
        
        posx+=chWidth+2;
    }

    ctx.restore();
    
    if(textureOut.get()) textureOut.get().initTexture(fontImage,CGL.Texture.FILTER_MIPMAP);

    textureOut.get().unpackAlpha=false;
}


