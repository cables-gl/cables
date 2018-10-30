op.name='TextureText';

var text=op.addInPort(new CABLES.Port(op,"text",CABLES.OP_PORT_TYPE_VALUE,{type:'string',display:'editor'}));
var inFontSize=op.addInPort(new CABLES.Port(op,"fontSize"));
var maximize=op.addInPort(new CABLES.Port(op,"Maximize Size",CABLES.OP_PORT_TYPE_VALUE,{display:'bool'}));
var texWidth=op.addInPort(new CABLES.Port(op,"texture width"));
var texHeight=op.addInPort(new CABLES.Port(op,"texture height"));
var align=op.addInPort(new CABLES.Port(op,"align",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['left','center','right']}));
var valign=op.addInPort(new CABLES.Port(op,"vertical align",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['top','center','bottom']}));
var font=op.addInPort(new CABLES.Port(op,"font",CABLES.OP_PORT_TYPE_VALUE,{type:'string'}));
var lineDistance=op.addInPort(new CABLES.Port(op,"line distance"));
var border=op.addInPort(new CABLES.Port(op,"border"));
var doRefresh=op.inTriggerButton("Refresh");

// var textureOut=op.addOutPort(new CABLES.Port(op,"texture",CABLES.OP_PORT_TYPE_TEXTURE));
var textureOut=op.outTexture("texture");
var outRatio=op.addOutPort(new CABLES.Port(op,"Ratio",CABLES.OP_PORT_TYPE_VALUE));

var cgl=op.patch.cgl;

doRefresh.onTriggered=refresh;

border.set(0);
texWidth.set(512);
texHeight.set(512);
lineDistance.set(1);
inFontSize.set(30);
font.set('Arial');
align.set('center');
valign.set('center');

var fontImage = document.createElement('canvas');
fontImage.id = "texturetext_"+CABLES.generateUUID();
fontImage.style.display = "none";
var body = document.getElementsByTagName("body")[0];
body.appendChild(fontImage);

var ctx = fontImage.getContext('2d');


function reSize()
{
    textureOut.get().setSize(texWidth.get(),texHeight.get());

    ctx.canvas.width=fontImage.width=texWidth.get();
    ctx.canvas.height=fontImage.height=texHeight.get();
    refresh();
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

    // if(text.get())
    {
        var txt=(text.get()+'').replace(/<br\/>/g, '\n');

        if(txt=='0')txt=' ';
        var strings = txt.split("\n");
        var posy=0,i=0;

        if(maximize.get())
        {
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
    }

    ctx.restore();
    outRatio.set(ctx.canvas.height/ctx.canvas.width);

    if(textureOut.get()) textureOut.get().initTexture(fontImage,CGL.Texture.FILTER_MIPMAP);
        else textureOut.set(new CGL.Texture.createFromImage( cgl, fontImage, { filter:CGL.Texture.FILTER_MIPMAP } ));

    textureOut.get().unpackAlpha=true;
}

align.onChange=refresh;
valign.onChange=refresh;
text.onChange=refresh;
inFontSize.onChange=refresh;
font.onChange=refresh;
lineDistance.onChange=refresh;
maximize.onChange=refresh;

texWidth.onChange=reSize;
texHeight.onChange=reSize;

border.onChange=refresh;

text.set('cables');
reSize();