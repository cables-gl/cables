const
    render=op.inTriggerButton("Render"),
    text=op.inString("text",'cables'),
    font=op.inString("font","Arial"),
    maximize=op.inValueBool("Maximize Size"),
    inFontSize=op.inValueFloat("fontSize",30),
    lineDistance=op.inValueFloat("line distance",1),
    texWidth=op.inValueInt("texture width",512),
    texHeight=op.inValueInt("texture height",512),
    align=op.inSwitch("align",['left','center','right'],'center'),
    valign=op.inSwitch("vertical align",['top','center','bottom'],'center'),
    border=op.inValueFloat("border",0),
    cachetexture=op.inValueBool("Reuse Texture",true),

    drawMesh=op.inValueBool("Draw Mesh",true),
    meshScale=op.inValueFloat("Scale Mesh",1.0),
    renderHard=op.inValueBool("Hard Edges",false),

    inOpacity=op.inFloatSlider("Opacity",1),

    outRatio=op.outValue("Ratio"),
    textureOut=op.outTexture("texture"),
    outAspect=op.outNumber("Aspect",1);

op.setPortGroup('Size',[font,maximize,inFontSize,lineDistance]);
op.setPortGroup('Texture Size',[texWidth,texHeight]);
op.setPortGroup('Alignment',[valign,align]);
op.setPortGroup('Rendering',[drawMesh,renderHard,meshScale]);

align.onChange=
    valign.onChange=
    text.onChange=
    inFontSize.onChange=
    font.onChange=
    border.onChange=
    lineDistance.onChange=
    maximize.onChange=function(){needsRefresh=true;};

texWidth.onChange=
    texHeight.onChange=reSize;

render.onTriggered=doRender;


textureOut.ignoreValueSerialize=true;

const cgl=op.patch.cgl;
const body = document.getElementsByTagName("body")[0];

var tex=new CGL.Texture(cgl);
var fontImage = document.createElement('canvas');
fontImage.id = "texturetext_"+CABLES.generateUUID();
fontImage.style.display = "none";
body.appendChild(fontImage);

const ctx = fontImage.getContext('2d');
var needsRefresh=true;
var mesh=CGL.MESHES.getSimpleRect(cgl,"texttexture rect");


const shader=new CGL.Shader(cgl,'texttexture');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.setSource(attachments.text_vert,attachments.text_frag);
const texUni=new CGL.Uniform(shader,'t','tex',0);
const aspectUni=new CGL.Uniform(shader,'f','aspect',0);
const opacityUni=new CGL.Uniform(shader,'f','a',inOpacity);


var vScale=vec3.create();

renderHard.onChange=function()
{
    shader.toggleDefine("HARD_EDGE",renderHard.get());
};

function doRender()
{
    if(needsRefresh)
    {
        reSize();
        refresh();
    }

    if(drawMesh.get())
    {
        vScale[0]=vScale[1]=vScale[2]=meshScale.get();
        cgl.pushBlendMode(CGL.BLEND_NORMAL,false);
        cgl.pushModelMatrix();
        mat4.scale(cgl.mMatrix,cgl.mMatrix, vScale);

        shader.popTextures();
        shader.pushTexture(texUni,tex.tex);
        aspectUni.set(outAspect.get());

        cgl.pushShader(shader);
        mesh.render(shader);

        cgl.popShader();
        cgl.popBlendMode();
        cgl.popModelMatrix();
    }
}

function reSize()
{
    if(!tex)return;
    tex.setSize(texWidth.get(),texHeight.get());

    ctx.canvas.width=fontImage.width=texWidth.get();
    ctx.canvas.height=fontImage.height=texHeight.get();

    outAspect.set(fontImage.width/fontImage.height);

    needsRefresh=true;
}

maximize.onChange =  function ()
{
    inFontSize.setUiAttribs({"greyout":maximize.get()});
    needsRefresh=true;
};

function refresh()
{
    ctx.clearRect(0,0,fontImage.width,fontImage.height);
    ctx.fillStyle = 'white';
    var fontSize=parseFloat(inFontSize.get());
    var fontname=font.get();
    if(fontname.indexOf(" ")>-1)fontname='"'+fontname+'"';
    ctx.font = fontSize+'px '+fontname+'';
    ctx.textAlign = align.get();

    if(border.get()>0)
    {
        ctx.beginPath();
        ctx.lineWidth=""+border.get();
        ctx.strokeStyle="white";
        ctx.rect(
            0,
            0,
            texWidth.get(),
            texHeight.get()
            );
        ctx.stroke();
    }

    var i=0;
    var txt=(text.get()+'').replace(/<br\/>/g, '\n');
    txt=(text.get()+'').replace(/<br>/g, '\n');
    var strings = txt.split("\n");
    var posy=0;

    needsRefresh=false;

    if(maximize.get())
    {
        fontSize=texWidth.get();
        var count=0;
        var maxWidth=0;
        var maxHeight=0;

        do
        {
            count++;
            if(count>(texHeight.get()+texWidth.get())/2 )
            {
                op.log("too many iterations - maximize size");
                break;
            }
            fontSize-=10;
            ctx.font = fontSize+'px "'+font.get()+'"';
            maxWidth=0;
            maxHeight=strings.length*fontSize*1.1;
            for(i=0;i<strings.length;i++) maxWidth=Math.max(maxWidth,ctx.measureText(strings[i]).width);
        }
        while(maxWidth>ctx.canvas.width || maxHeight>ctx.canvas.height);
    }

    if(valign.get()=='center')
    {
        var maxy=(strings.length-1.5)*fontSize+parseFloat(lineDistance.get());
        posy=ctx.canvas.height / 2-maxy/2;
    }
    else if(valign.get()=='top') posy=fontSize;
    else if(valign.get()=='bottom')  posy=ctx.canvas.height -(strings.length)*(parseFloat(inFontSize.get())+parseFloat(lineDistance.get()));

    for(i=0;i<strings.length;i++)
    {
        if(align.get()=='center') ctx.fillText(strings[i], ctx.canvas.width / 2, posy);
        if(align.get()=='left') ctx.fillText(strings[i], 0, posy);
        if(align.get()=='right') ctx.fillText(strings[i], ctx.canvas.width, posy);
        posy+=fontSize+parseFloat(lineDistance.get());
    }

    ctx.restore();
    outRatio.set(ctx.canvas.height/ctx.canvas.width);

    if(!cachetexture.get() || !tex) textureOut.set(new CGL.Texture.createFromImage( cgl, fontImage, { filter:CGL.Texture.FILTER_MIPMAP } ));

    tex.initTexture(fontImage,CGL.Texture.FILTER_MIPMAP);
    tex.unpackAlpha=true;




}

