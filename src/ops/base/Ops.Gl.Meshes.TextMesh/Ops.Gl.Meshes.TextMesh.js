
op.name='TextMesh';

var render=op.inFunction("Render");
var textureOut=op.outTexture("texture");
var str=op.inValueString("Text","cables");
var scale=op.inValue("Scale",10);
var inFont=op.inValueString("Font","Arial");
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
var characters='?abcdefghijklmnopqrstuvwxyz';

var cgl=op.patch.cgl;
var geom=null;
var mesh=null;
var transformations=[];
var createMesh=true;
var createTexture=true;

textureOut.set(null);
inFont.onChange=function(){ createTexture=true;createMesh=true; };

op.onDelete=function()
{
    fontImage.remove();
};

var srcFrag=''
    .endl()+'precision mediump float;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'varying vec2 texCoord;'
    .endl()+'uniform float r;'
    .endl()+'uniform float g;'
    .endl()+'uniform float b;'
    .endl()+'uniform float a;'

    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    .endl()+'   col.a=col.r;'
    .endl()+'   col.r*=r;'
    .endl()+'   col.g*=g;'
    .endl()+'   col.b*=b;'
    .endl()+'   col.a*=a;'
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

var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
r.set(Math.random());
r.uniform=new CGL.Uniform(shader,'f','r',r);

var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range'}));
g.set(Math.random());
g.uniform=new CGL.Uniform(shader,'f','g',g);

var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
b.set(Math.random());
r.uniform=new CGL.Uniform(shader,'f','b',b);

var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range'}));
a.uniform=new CGL.Uniform(shader,'f','a',a);
a.set(1.0);


render.onTriggered=function()
{
    if(createTexture) generateTexture();
    if(createMesh)generateMesh();


    cgl.gl.blendFunc(cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.setShader(shader);

    cgl.setTexture(0,textureOut.get().tex);

    mesh.render(cgl.getShader());
    
    cgl.setTexture(0,null);
    cgl.setPreviousShader();

    cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);
};



function generateMesh()
{
    if(!textureOut.get())return;
    if(!geom)
    {
        geom=new CGL.Geometry();
        
        geom.vertices = [
            1.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            1.0, 0.0, 0.0,
            0.0, 0.0, 0.0
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
    createTexture=false;
    
    for(var i=0;i<numChars;i++)
    {
        var chStr=txt.substring(i,i+1);
        var char=chars[chStr];
        if(!char)
        {
            characters+=chStr;
            createTexture=true;
            return;
        }
        else
        {
            tcOffsets[i*2+0]=char.texCoordX;
            tcOffsets[i*2+1]=1-char.texCoordY-char.texCoordHeight;
    
            tcSize[i*2+0]=char.texCoordWidth;
            tcSize[i*2+1]=char.texCoordHeight;
    
            mat4.identity(m);
            mat4.translate(m,m,[pos,0,0]);
            pos+=char.texCoordWidth;
            transformations[i]=Array.prototype.slice.call(m);
        }
    }
    
    var arrs = [].concat.apply([], transformations);
    var matrices = new Float32Array(arrs);
    
    mesh.numInstances=numChars;
    mesh.setAttribute('instMat',matrices,16,{"instanced":true});
    mesh.setAttribute('attrTexOffsets',tcOffsets,2,{"instanced":true});
    mesh.setAttribute('attrTexSize',tcSize,2,{"instanced":true});
    
    if(createTexture) generateTexture();
}



function printChars(fontSize,simulate)
{
    if(!simulate)
    {
        chars={};
    }

    ctx.font = fontSize+'px '+inFont.get();
    ctx.textAlign = "left";

    var posy=0,i=0;
    var posx=0;
    var lineHeight=fontSize*1.4;
    var result=
        {
            "fits":true
        };

    for(i=0;i<characters.length;i++)
    {
        var chStr=characters.substring(i,i+1);
        var chWidth=Math.round(ctx.measureText(chStr).width);

        if(posx+chWidth>=textureSize)
        {
            posy+=lineHeight+2;
            posx=0;
        }

        if(!simulate)
        {
            chars[chStr]=
                {
                    str:chStr,
                    texCoordX:posx/textureSize,
                    texCoordY:posy/textureSize,
                    texCoordWidth:chWidth/textureSize,
                    texCoordHeight:lineHeight/textureSize,
                };
            
            ctx.fillText(chStr, posx, posy+fontSize);
        }

        posx+=chWidth+2;
    }

    if(posy>textureSize-lineHeight)
    {
        result.fits=false;
    }
    
    result.spaceLeft=textureSize-posy;

    return result;
}

var fontSize=320;

function generateTexture()
{
    ctx.canvas.width=fontImage.width=ctx.canvas.height=fontImage.height=textureSize;
    
    if(!textureOut.get()) textureOut.set( CGL.Texture.createFromImage(cgl,fontImage,
        {
            filter:CGL.Texture.FILTER_MIPMAP
        }));

    textureOut.get().setSize(textureSize,textureSize);

    ctx.fillStyle = 'transparent';
    ctx.clearRect(0,0,textureSize,textureSize);
    ctx.fillStyle = 'rgba(255,255,255,255)';

    fontSize+=40;
    
    var simu=printChars(fontSize,true);
    while(!simu.fits)
    {
        fontSize-=5;
        simu=printChars(fontSize,true);
    }

    printChars(fontSize,false);

    ctx.restore();
    
    if(textureOut.get()) textureOut.get().initTexture(fontImage,CGL.Texture.FILTER_MIPMAP);

    textureOut.get().unpackAlpha=true;
    
    textureOut.get().printInfo();
    
    createMesh=true;
    createTexture=false;
}


