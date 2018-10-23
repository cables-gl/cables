var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string' } ));

var texWidth=op.inValueInt("texture width");
var texHeight=op.inValueInt("texture height");

var wrap=op.addInPort(new Port(op,"wrap",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['repeat','mirrored repeat','clamp to edge']}));
var tfilter=op.addInPort(new Port(op,"filter",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['nearest','linear','mipmap']}));

var textureOut=op.outTexture("texture");


tfilter.onValueChanged=onFilterChange;
wrap.onValueChanged=onWrapChange;


texWidth.set(1024);
texHeight.set(1024);

var cgl=op.patch.cgl;
var canvas=null;
var ctx=null;

function removeCanvas()
{
    if(!canvas)return;
    canvas.remove();
    canvas=null;
}

function createCanvas()
{
    if(canvas)removeCanvas();
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d',{alpha:true});

    ctx.canvas.width=canvas.width=texWidth.get();
    ctx.canvas.height=canvas.height=texHeight.get();

    canvas.style.display = "none";
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);
}


textureOut.set(new CGL.Texture(cgl));

function reSize()
{
    update();
}

var data = "data:image/svg+xml," +
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
           '<foreignObject width="100%" height="100%">' +
           '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:40px">' +
            //  '<em>I</em> like ' + 
            //  '<span style="color:white; text-shadow:0 0 2px blue;">' +
            //  'cables</span>' +
           '</div>' +
           '</foreignObject>' +
           '</svg>';

var cgl_filter=CGL.Texture.FILTER_MIPMAP;
var cgl_wrap=CGL.Texture.WRAP_REPEAT;

function onFilterChange()
{
    if(tfilter.get()=='nearest') cgl_filter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear') cgl_filter=CGL.Texture.FILTER_LINEAR;
    if(tfilter.get()=='mipmap') cgl_filter=CGL.Texture.FILTER_MIPMAP;

    reload();
}

function onWrapChange()
{
    if(wrap.get()=='repeat') cgl_wrap=CGL.Texture.WRAP_REPEAT;
    if(wrap.get()=='mirrored repeat') cgl_wrap=CGL.Texture.WRAP_MIRRORED_REPEAT;
    if(wrap.get()=='clamp to edge') cgl_wrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reload();
}


function reload()
{
    var loadingId=op.patch.loading.start('svg file',filename.get());
    CABLES.ajax(
        op.patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            data="data:image/svg+xml,"+_data;
            
            data=data.replace( /#/g, '%23' );
            // console.log(data);
            
            op.patch.loading.finished(loadingId);
            update();
        }
    );
}

function update()
{
    
    
    var img = new Image();
    var loadingId=op.patch.loading.start('svg2texture',filename.get());

    img.onerror = function(e)
    {
        op.patch.loading.finished(loadingId);
        op.uiAttr( { 'error': 'Could not load SVG file!' } );
        console.log('Could not load SVG file');
        console.log(e);
        
    };
    
    img.onload = function()
    {
        createCanvas();
        op.patch.loading.finished(loadingId);
        canvas.width=texWidth.get();
        canvas.height=texHeight.get();
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height );
        textureOut.set(new CGL.Texture.createFromImage(cgl,canvas,
        {
            wrap:cgl_wrap,
            filter:cgl_filter,
            width: canvas.width, 
            height: canvas.height,
            unpackAlpha:true
        }));
        removeCanvas();
    };

    img.src = data;
    
}

op.onFileChanged=function(fn)
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

tfilter.set("mipmap");