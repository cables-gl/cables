const
    text=op.inStringEditor("text",'cables'),
    doRefresh=op.inTriggerButton("Refresh"),
    font=op.inString("font","Arial"),
    maximize=op.inValueBool("Maximize Size"),
    inFontSize=op.inValueFloat("fontSize",30),
    lineDistance=op.inValueFloat("line distance",1),
    texWidth=op.inValueInt("texture width",512),
    texHeight=op.inValueInt("texture height",512),
    align=op.inValueSelect("align",['left','center','right'],'center'),
    valign=op.inValueSelect("vertical align",['top','center','bottom'],'center'),
    border=op.inValueFloat("border",0),
    cachetexture=op.inValueBool("Reuse Texture",true),
    outRatio=op.outValue("Ratio"),
    textureOut=op.outTexture("texture");

op.setPortGroup('Size',[font,maximize,inFontSize,lineDistance]);
op.setPortGroup('Texture Size',[texWidth,texHeight]);
op.setPortGroup('Alignment',[valign,align]);

textureOut.ignoreValueSerialize=true;

const cgl=op.patch.cgl;
const body = document.getElementsByTagName("body")[0];

doRefresh.onTriggered=refresh;

var fontImage = document.createElement('canvas');
fontImage.id = "texturetext_"+CABLES.generateUUID();
fontImage.style.display = "none";
body.appendChild(fontImage);

const ctx = fontImage.getContext('2d');

align.onChange=
    valign.onChange=
    text.onChange=
    inFontSize.onChange=
    font.onChange=
    border.onChange=
    lineDistance.onChange=
    maximize.onChange=refresh;

texWidth.onChange=
    texHeight.onChange=reSize;

refresh();
reSize();

function reSize()
{
    textureOut.get().setSize(texWidth.get(),texHeight.get());

    ctx.canvas.width=fontImage.width=texWidth.get();
    ctx.canvas.height=fontImage.height=texHeight.get();
    refresh();
}

maximize.onChange =  function ()
{
    if(maximize.get())
    {
        inFontSize.setUiAttribs({hidePort:true,greyout:true});
    }
    else
    {
        inFontSize.setUiAttribs({hidePort:false,greyout:false});
    }
}
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

    if(maximize.get())
    {
        // inFontSize.setUiAttribs({hidePort:true,greyout:true});

        fontSize=texWidth.get();
        var count=0;
        var maxWidth=0;
        var maxHeight=0;

        do
        {
            count++;
            if(count>300)break;
            fontSize-=10;
            ctx.font = fontSize+'px "'+font.get()+'"';
            maxWidth=0;
            maxHeight=strings.length*fontSize*1.1;
            for(i=0;i<strings.length;i++)
            {
                maxWidth=Math.max(maxWidth,ctx.measureText(strings[i]).width);
            }
        }
        while(maxWidth>ctx.canvas.width || maxHeight>ctx.canvas.height);
    }
    else
    {
        // inFontSize.setUiAttribs({hidePort:false,greyout:false});
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


    if(!cachetexture.get() || !textureOut.get()) textureOut.set(new CGL.Texture.createFromImage( cgl, fontImage, { filter:CGL.Texture.FILTER_MIPMAP } ));

    textureOut.get().initTexture(fontImage,CGL.Texture.FILTER_MIPMAP);
    textureOut.get().unpackAlpha=true;
}

