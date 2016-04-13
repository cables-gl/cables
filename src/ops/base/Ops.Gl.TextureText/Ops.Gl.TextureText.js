var cgl=op.patch.cgl;

op.name='TextureText';
var text=op.addInPort(new Port(op,"text",OP_PORT_TYPE_VALUE,{type:'string',display:'editor'}));
var fontSize=op.addInPort(new Port(op,"fontSize"));
var texWidth=op.addInPort(new Port(op,"texture width"));
var texHeight=op.addInPort(new Port(op,"texture height"));
var align=op.addInPort(new Port(op,"align",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['left','center','right']}));
var valign=op.addInPort(new Port(op,"vertical align",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['top','center','bottom']}));
var font=op.addInPort(new Port(op,"font",OP_PORT_TYPE_VALUE,{type:'string'}));
var lineDistance=op.addInPort(new Port(op,"line distance"));
var border=op.addInPort(new Port(op,"border"));

var textureOut=op.addOutPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE));

border.set(0);
texWidth.set(512);
texHeight.set(512);
lineDistance.set(1);
fontSize.set(30);
font.set('Arial');
align.set('center');
valign.set('center');

var canvas = document.createElement('canvas');
canvas.id = "hiddenCanvas";
canvas.style.display = "none";
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

var fontImage = document.getElementById('hiddenCanvas');
var ctx = fontImage.getContext('2d');

function reSize()
{
    textureOut.get().setSize(texWidth.get(),texHeight.get());
    ctx.canvas.width=canvas.width=texWidth.get();
    ctx.canvas.height=canvas.height=texHeight.get();
    refresh();
}

function refresh()
{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = fontSize.get()+'px "'+font.get()+'"';
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
    


    if(text.get())
    {
        var txt=text.get().replace(/<br\/>/g, '\n');

        var strings = txt.split("\n");
        var posy=0,i=0;

        if(valign.get()=='center') 
        {
            var maxy=(strings.length-1.5)*(parseFloat(fontSize.get())+parseFloat(lineDistance.get()));
            posy=ctx.canvas.height / 2-maxy/2;
        }
        else if(valign.get()=='top') posy=parseFloat(fontSize.get());
        else if(valign.get()=='bottom')  posy=ctx.canvas.height -(strings.length)*(parseFloat(fontSize.get())+parseFloat(lineDistance.get()));

        for(i=0;i<strings.length;i++)
        {
            if(align.get()=='center') ctx.fillText(strings[i], ctx.canvas.width / 2, posy);
            if(align.get()=='left') ctx.fillText(strings[i], 0, posy);
            if(align.get()=='right') ctx.fillText(strings[i], ctx.canvas.width, posy);
            posy+=parseFloat(fontSize.get())+parseFloat(lineDistance.get());
        }
    }

    ctx.restore();

    if(textureOut.get()) textureOut.get().initTexture(fontImage,CGL.Texture.FILTER_MIPMAP);
        else textureOut.set(new CGL.Texture.fromImage(cgl,fontImage,CGL.Texture.FILTER_MIPMAP));
}

align.onValueChanged=refresh;
valign.onValueChanged=refresh;
text.onValueChanged=refresh;
fontSize.onValueChanged=refresh;
font.onValueChanged=refresh;
lineDistance.onValueChanged=refresh;

texWidth.onValueChanged=reSize;
texHeight.onValueChanged=reSize;

border.onValueChanged=refresh;

text.set('cables');
reSize();