var cgl=this.patch.cgl;
var patch=this.patch;

this.name='SVG Texture';

var filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string' } ));
var texWidth=this.addInPort(new Port(this,"texture width"));
var texHeight=this.addInPort(new Port(this,"texture height"));
var textureOut=this.addOutPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE));

texWidth.set(1024);
texHeight.set(1024);

var canvas=null;
var ctx=null;

function createCanvas()
{
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    canvas.style.display = "none";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);
}

function reSize()
{
    if(!textureOut.val) textureOut.val=new CGL.Texture(cgl);

    ctx = canvas.getContext('2d');

    textureOut.val.setSize(texWidth.get(),texHeight.get());
    ctx.canvas.width=canvas.width=texWidth.get();
    ctx.canvas.height=canvas.height=texHeight.get();

    update();
}

var data = "data:image/svg+xml," +
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
           '<foreignObject width="100%" height="100%">' +
           '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
             '<em>I</em> like ' + 
             '<span style="color:white; text-shadow:0 0 2px blue;">' +
             'cables</span>' +
           '</div>' +
           '</foreignObject>' +
           '</svg>';

function reload()
{
    console.log('loading file');
    CABLES.ajax(
        patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            console.log('loading file finished...');
            console.log(_data);
            data="data:image/svg+xml,"+_data;
            update();
        }
    );
}

function update()
{
    var img = new Image();

    img.onerror = function()
    {
        console.log('svg error');
    }
    
    img.onload = function()
    {
        console.log('finished loading img...')
        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height );
        textureOut.val=new CGL.Texture.fromImage(cgl,canvas,CGL.Texture.FILTER_MIPMAP);
    }
    
    img.src = data;    
}

this.onFileUploaded=function(fn)
{
    if(filename.get() && filename.get().endsWith(fn))
    {
        reload();
    }
};

filename.onValueChange(reload);

texWidth.onValueChanged=reSize;
texHeight.onValueChanged=reSize;

createCanvas();
reSize();
