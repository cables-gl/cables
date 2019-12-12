const
    render=op.inTrigger("Render"),
    str=op.inString("Text","cables"),
    scale=op.inValueFloat("Scale",1),
    inFont=op.inString("Font","Arial"),
    align=op.inValueSelect("align",['left','center','right'],'center'),
    valign=op.inValueSelect("vertical align",['Top','Middle','Bottom'],'Middle'),
    lineHeight=op.inValueFloat("Line Height",1),
    letterSpace=op.inValueFloat("Letter Spacing"),
    inMulTex=op.inTexture("Multiply Texture"),
    next=op.outTrigger("Next"),
    textureOut=op.outTexture("texture"),
    outLines=op.outNumber("Total Lines",0),
    loaded=op.outValue("Font Available",0);

const cgl=op.patch.cgl;


const filter=CGL.Texture.FILTER_MIPMAP;
const textureSize=1024;
var fontLoaded=false;
var needUpdate=true;

align.onChange=
    str.onChange=
    lineHeight.onChange=generateMeshLater;


function generateMeshLater()
{
    needUpdate=true;
}

var canvasid=null;
CABLES.OpTextureMeshCanvas={};
var valignMode=0;


var geom=null;
var mesh=null;

var createMesh=true;
var createTexture=true;

inMulTex.onChange=function()
{
    shader.toggleDefine("DO_MULTEX",inMulTex.get());
};

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
    try
    {
        fontLoaded=document.fonts.check('20px '+inFont.get());
    }
    catch(ex)
    {
        console.log(ex);
    }

    if(!oldFontLoaded && fontLoaded)
    {
        loaded.set(true);
        createTexture=true;
        createMesh=true;
    }

    if(!fontLoaded) setTimeout(checkFont,250);
}


valign.onChange=function()
{
    if(valign.get()=='Middle')valignMode=0;
    else if(valign.get()=='Top')valignMode=1;
    else if(valign.get()=='Bottom')valignMode=2;
};

function getFont()
{
    canvasid=''+inFont.get();
    if(CABLES.OpTextureMeshCanvas.hasOwnProperty(canvasid))
        return CABLES.OpTextureMeshCanvas[canvasid];

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
    if(canvasid && CABLES.OpTextureMeshCanvas[canvasid])
        CABLES.OpTextureMeshCanvas[canvasid].canvas.remove();
};

var shader=new CGL.Shader(cgl,'TextMesh');
shader.setSource(attachments.textmesh_vert,attachments.textmesh_frag);
var uniTex=new CGL.Uniform(shader,'t','tex',0);
var uniTexMul=new CGL.Uniform(shader,'t','texMul',1);
var uniScale=new CGL.Uniform(shader,'f','scale',scale);

const
    r = op.inValueSlider("r", 1),
    g = op.inValueSlider("g", 1),
    b = op.inValueSlider("b", 1),
    a = op.inValueSlider("a", 1),
    runiform=new CGL.Uniform(shader,'f','r',r),
    guniform=new CGL.Uniform(shader,'f','g',g),
    buniform=new CGL.Uniform(shader,'f','b',b),
    auniform=new CGL.Uniform(shader,'f','a',a);
r.setUiAttribs({ colorPick: true });

op.setPortGroup('Display',[scale,inFont]);
op.setPortGroup('Alignment',[align,valign]);
op.setPortGroup('Color',[r,g,b,a]);


var height=0;
var vec=vec3.create();
var lastTextureChange=-1;
var disabled=false;

render.onTriggered=function()
{
    if(needUpdate)
    {
        generateMesh();
        needUpdate=false;
    }
    var font=getFont();
    if(font.lastChange!=lastTextureChange)
    {
        createMesh=true;
        lastTextureChange=font.lastChange;
    }

    if(createTexture) generateTexture();
    if(createMesh)generateMesh();

    if(mesh && mesh.numInstances>0)
    {
        cgl.pushBlendMode(CGL.BLEND_NORMAL,true);
        cgl.setShader(shader);
        cgl.setTexture(0,textureOut.get().tex);

        var mulTex=inMulTex.get();
        if(mulTex)cgl.setTexture(1,mulTex.tex);


        if(valignMode===2) vec3.set(vec, 0,height,0);
        else if(valignMode===1) vec3.set(vec, 0,0,0);
        else if(valignMode===0) vec3.set(vec, 0,height/2,0);
        vec[1]-=lineHeight.get();
        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix,cgl.mMatrix, vec);
        if(!disabled)mesh.render(cgl.getShader());

        cgl.popModelMatrix();

        cgl.setTexture(0,null);
        cgl.setPreviousShader();
        cgl.popBlendMode();
    }

    next.trigger();
};

letterSpace.onChange=function()
{
    createMesh=true;
};


function generateMesh()
{
    var theString=String(str.get()+'');
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
    outLines.set(strings.length);

    var transformations=[];
    var tcOffsets=[];//new Float32Array(str.get().length*2);
    var tcSize=[];//new Float32Array(str.get().length*2);
    var texPos=[];
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
            if(char)
            {
                width+=(char.texCoordWidth/char.texCoordHeight);
                width+=letterSpace.get();
            }
        }
        width-=letterSpace.get();

        height=0;

        if(align.get()=='left') offX=0;
        else if(align.get()=='right') offX=width;
        else if(align.get()=='center') offX=width/2;

        height=(s+1)*lineHeight.get();

        for(var i=0;i<numChars;i++)
        {
            const chStr=txt.substring(i,i+1);
            const char=font.chars[String(chStr)];

            if(!char)
            {
                createTexture=true;
                return;
            }
            else
            {
                texPos.push(pos/width*0.99+0.005,(1.0-(s/(strings.length-1)))*0.99+0.005);
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

    mesh.setAttribute('attrTexPos',new Float32Array(texPos),2,{"instanced":true});

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
                filter:filter
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

    font.texture.initTexture(font.canvas,filter);
    font.texture.unpackAlpha=true;
    textureOut.set(font.texture);

    font.lastChange=CABLES.now();

    createMesh=true;
    createTexture=false;
}
