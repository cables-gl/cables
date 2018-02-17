op.name='TextMesh';

var render=op.inFunction("Render");
var next=op.outFunction("Next");
var textureOut=op.outTexture("texture");
var str=op.inValueString("Text","cables");
var scale=op.inValue("Scale",1);
var inFont=op.inValueString("Font","Arial");
var align=op.inValueSelect("align",['left','center','right'],'center');
var valign=op.inValueSelect("vertical align",['Top','Middle','Bottom'],'Middle');
var lineHeight=op.inValue("Line Height",1);
var letterSpace=op.addInPort(new Port(op,"Letter Spacing"));

var loaded=op.outValue("Font Available",0);

var cgl=op.patch.cgl;

var textureSize=2048;
var fontLoaded=false;

align.onChange=generateMesh;
str.onChange=generateMesh;

lineHeight.onChange=generateMesh;
var cgl=op.patch.cgl;
var geom=null;
var mesh=null;

var createMesh=true;
var createTexture=true;

textureOut.set(null);
inFont.onChange=function()
    {
        createTexture=true;
        createMesh=true;
        checkFont();
    };

function checkFont()
{
    var oldFontLoaded=fontLoaded;
    fontLoaded=document.fonts.check('20px '+inFont.get());

    if(!oldFontLoaded && fontLoaded)
    {
        loade=true;
        createTexture=true;
        createMesh=true;
    }

    if(!fontLoaded) setTimeout(checkFont,250);
}

var canvasid=null;


CABLES.OpTextureMeshCanvas={};

var valignMode=0;

valign.onChange=function()
{
    if(valign.get()=='Middle')valignMode=0;
    if(valign.get()=='Top')valignMode=1;
    if(valign.get()=='Bottom')valignMode=2;
};

function getFont()
{
    canvasid=''+inFont.get();
    if(CABLES.OpTextureMeshCanvas.hasOwnProperty(canvasid))
    {
        return CABLES.OpTextureMeshCanvas[canvasid];
    }

    var fontImage = document.createElement('canvas');
    fontImage.dataset.font=inFont.get();
    fontImage.id = "texturetext_"+CABLES.generateUUID();
    fontImage.style.display = "none";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(fontImage);
    var _ctx= fontImage.getContext('2d');
    CABLES.OpTextureMeshCanvas[canvasid]=
        {
            ctx:_ctx,
            canvas:fontImage,
            chars:{},
            characters:'?',
            fontSize:320
        };
    return CABLES.OpTextureMeshCanvas[canvasid];

}



op.onDelete=function()
{
    // fontImage.remove();
    if(canvasid && CABLES.OpTextureMeshCanvas[canvasid])
        CABLES.OpTextureMeshCanvas[canvasid].canvas.remove();


};

var srcFrag=''
    .endl()+'precision mediump float;'
    .endl()+'UNI sampler2D tex;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'UNI float r;'
    .endl()+'UNI float g;'
    .endl()+'UNI float b;'
    .endl()+'UNI float a;'

    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 col=texture2D(tex,texCoord);'
    .endl()+'   col.a=col.r;'
    // .endl()+'   col.a=1.0;'
    .endl()+'   col.r*=r;'
    .endl()+'   col.g*=g;'
    .endl()+'   col.b*=b;'
    .endl()+'   col*=a;'

    .endl()+'   gl_FragColor=col;'
    .endl()+'}'
    .endl();

var srcVert=''
    .endl()+'precision mediump float;'
    .endl()+'UNI sampler2D tex;'
    .endl()+'UNI mat4 projMatrix;'
    .endl()+'UNI mat4 modelMatrix;'
    .endl()+'UNI mat4 viewMatrix;'
    .endl()+'UNI float scale;'
    .endl()+'IN vec3 vPosition;'
    .endl()+'IN vec2 attrTexCoord;'
    .endl()+'IN mat4 instMat;'
    .endl()+'IN vec2 attrTexOffsets;'
    .endl()+'IN vec2 attrTexSize;'

    .endl()+'OUT vec2 texCoord;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   texCoord=(attrTexCoord*(attrTexSize)) + attrTexOffsets;'
    .endl()+'   mat4 instModelMat=instMat;'
    .endl()+'   instModelMat[3][0]*=scale;'

    .endl()+'   vec4 vert=vec4( vPosition.x*(attrTexSize.x/attrTexSize.y)*scale,vPosition.y*scale,vPosition.z*scale, 1. );'

    .endl()+'   mat4 mvMatrix=viewMatrix * modelMatrix * instModelMat;'

// .endl()+'    #define BILLBOARD'
// .endl()+'    #ifdef BILLBOARD'
// .endl()+'       vec3 position=vert.xyz;'
// .endl()+'       mat4 mvMatrix=viewMatrix*modelMatrix;'

// .endl()+'       gl_Position = projMatrix * mvMatrix * vec4(('
// .endl()+'           position.x * vec3('
// .endl()+'               mvMatrix[0][0],'
// .endl()+'               mvMatrix[1][0],'
// .endl()+'               mvMatrix[2][0] ) +'
// .endl()+'           position.y * vec3('
// .endl()+'               mvMatrix[0][1],'
// .endl()+'               mvMatrix[1][1],'
// .endl()+'               mvMatrix[2][1]) ), 1.0);'
// .endl()+'    #endif'
// .endl()+'    #ifndef BILLBOARD'
// .endl()+'        mat4 mvMatrix=viewMatrix * modelMatrix * instModelMat;'
// .endl()+'    #endif'

    .endl()+'   #ifndef BILLBOARD'
    .endl()+'       gl_Position = projMatrix * mvMatrix * vert;'
    .endl()+'   #endif'
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

var height=0;

var vec=vec3.create();
var lastTextureChange=-1;
var disabled=false;

render.onTriggered=function()
{
    if(op.instanced(render))return;

    var font=getFont();
    if(font.lastChange!=lastTextureChange)
    {
        createMesh=true;
        lastTextureChange=font.lastChange;
    }

    if(createTexture) generateTexture();
    if(createMesh)generateMesh();

    cgl.gl.blendFunc(cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.setShader(shader);

    cgl.setTexture(0,textureOut.get().tex);

    if(valignMode==2) vec3.set(vec, 0,height,0);
    if(valignMode==1) vec3.set(vec, 0,0,0);
    if(valignMode==0) vec3.set(vec, 0,height/2,0);
    vec[1]-=lineHeight.get();
    cgl.pushModelMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
    if(mesh && !disabled)mesh.render(cgl.getShader());

    cgl.popModelMatrix();


    cgl.setTexture(0,null);
    cgl.setPreviousShader();

    cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);
    
    next.trigger();
};

letterSpace.onChange=function()
{
    createMesh=true;
};


function generateMesh()
{
    var theString=String(str.get()+'');
    // if(!(''+))return;
    if(!textureOut.get())return;


    var font=getFont();
    if(!font.geom)
    {
        font.geom=new CGL.Geometry("textmesh");

        font.geom.vertices = [
            1.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            1.0, 0.0, 0.0,
            0.0, 0.0, 0.0
        ];

        font.geom.texCoords = new Float32Array([
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            0.0, 0.0
        ]);

        font.geom.verticesIndices = [
            0, 1, 2,
            3, 1, 2
        ];
    }

    if(!mesh)mesh=new CGL.Mesh(cgl,font.geom);

    var strings=(theString).split('\n');

    var transformations=[];
    var tcOffsets=[];//new Float32Array(str.get().length*2);
    var tcSize=[];//new Float32Array(str.get().length*2);
    var charCounter=0;
    createTexture=false;
    var m=mat4.create();



    for(var s=0;s<strings.length;s++)
    {
        var txt=strings[s];
        var numChars=txt.length;

        var pos=0;
        var offX=0;
        var width=0;

        for(var i=0;i<numChars;i++)
        {
            var chStr=txt.substring(i,i+1);
            var char=font.chars[String(chStr)];
            if(char) width+=(char.texCoordWidth/char.texCoordHeight);
        }

        height=0;

        if(align.get()=='left') offX=0;
        else if(align.get()=='right') offX=width;
        else if(align.get()=='center') offX=width/2;

        height=(s+1)*lineHeight.get();

        for(var i=0;i<numChars;i++)
        {
            var chStr=txt.substring(i,i+1);
            var char=font.chars[String(chStr)];


            if(!char)
            {
                createTexture=true;
                return;
            }
            else
            {
                tcOffsets.push(char.texCoordX,1-char.texCoordY-char.texCoordHeight);
                tcSize.push(char.texCoordWidth,char.texCoordHeight);

                mat4.identity(m);
                mat4.translate(m,m,[pos-offX,0-s*lineHeight.get(),0]);

                pos+=(char.texCoordWidth/char.texCoordHeight)+letterSpace.get();
                transformations.push(Array.prototype.slice.call(m));

                charCounter++;
            }
        }
    }

    var transMats = [].concat.apply([], transformations);

    disabled=false;
    if(transMats.length==0)disabled=true;

    mesh.numInstances=transMats.length/16;

    if(mesh.numInstances==0)
    {
        disabled=true;
        return;
    }


    mesh.setAttribute('instMat',new Float32Array(transMats),16,{"instanced":true});
    mesh.setAttribute('attrTexOffsets',new Float32Array(tcOffsets),2,{"instanced":true});
    mesh.setAttribute('attrTexSize',new Float32Array(tcSize),2,{"instanced":true});

    createMesh=false;

    if(createTexture) generateTexture();
}

function printChars(fontSize,simulate)
{
    var font=getFont();
    if(!simulate) font.chars={};

    var ctx=font.ctx;

    ctx.font = fontSize+'px '+inFont.get();
    ctx.textAlign = "left";

    var posy=0,i=0;
    var posx=0;
    var lineHeight=fontSize*1.4;
    var result=
        {
            "fits":true
        };

    for(var i=0;i<font.characters.length;i++)
    {
        var chStr=String(font.characters.substring(i,i+1));
        var chWidth=(ctx.measureText(chStr).width);

        if(posx+chWidth>=textureSize)
        {
            posy+=lineHeight+2;
            posx=0;
        }

        if(!simulate)
        {
            font.chars[chStr]=
                {
                    str:chStr,
                    texCoordX:posx/textureSize,
                    texCoordY:posy/textureSize,
                    texCoordWidth:chWidth/textureSize,
                    texCoordHeight:lineHeight/textureSize,
                };

            ctx.fillText(chStr, posx, posy+fontSize);
        }

        posx+=chWidth+12;
    }

    if(posy>textureSize-lineHeight)
    {
        result.fits=false;
    }

    result.spaceLeft=textureSize-posy;

    return result;
}

function generateTexture()
{
    var font=getFont();
    var string=String(str.get());
    if(string==null || string==undefined)string='';
    for(var i=0;i<string.length;i++)
    {
        var ch=string.substring(i,i+1);
        if(font.characters.indexOf(ch)==-1)
        {
            font.characters+=ch;
            createTexture=true;
        }
    }

    var ctx=font.ctx;
    font.canvas.width=font.canvas.height=textureSize;

    if(!font.texture)
        font.texture=CGL.Texture.createFromImage(cgl,font.canvas,
            {
                filter:CGL.Texture.FILTER_MIPMAP
            });

    font.texture.setSize(textureSize,textureSize);

    ctx.fillStyle = 'transparent';
    ctx.clearRect(0,0,textureSize,textureSize);
    ctx.fillStyle = 'rgba(255,255,255,255)';

    var fontSize=font.fontSize+40;

    var simu=printChars(fontSize,true);
    while(!simu.fits)
    {
        fontSize-=5;
        simu=printChars(fontSize,true);
    }

    printChars(fontSize,false);

    ctx.restore();

    font.texture.initTexture(font.canvas,CGL.Texture.FILTER_MIPMAP);
    font.texture.unpackAlpha=true;
    textureOut.set(font.texture);

    font.lastChange=CABLES.now();

    createMesh=true;
    createTexture=false;
}
