const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    inNum=op.inValueInt("Num Points",2000),
    inSeed=op.inValueFloat("Seed",1),
    zPos = op.inValueSelect("Z Position",['None','Red','Green','Blue','Alpha'],'Red'),
    tex = op.inObject("texture"),
    outTrigger = op.outTrigger("trigger"),
    outPoints = op.outArray("Points"),
    outPointsNum = op.outValue("NumPoints");

var fb = null,
    pixelData = null,
    texChanged = false;

op.toWorkPortsNeedToBeLinked(tex,outPoints);

tex.onChange = function (){ texChanged=true; };

var channelType=op.patch.cgl.gl.UNSIGNED_BYTE;
var points=[];

pUpdate.onTriggered =updatePixels;

const NUM_COL_CHANNELS=4;


function updatePixels ()
{
    var realTexture = tex.get(), gl = cgl.gl;

    if (!realTexture) return;
    if (!fb) fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    if (texChanged)
    {
        gl.framebufferTexture2D(
           gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
           gl.TEXTURE_2D, realTexture.tex, 0
        );

        pixelData = new Uint8Array(realTexture.width*realTexture.height*NUM_COL_CHANNELS);
        texChanged = false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.readPixels(
        0, 0,
        realTexture.width,
        realTexture.height,
        gl.RGBA,
        channelType,
        pixelData
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var num=inNum.get();
    var numPixels=pixelData.length;

    if(num*3!=points.length)points.length=num*3;

    Math.randomSeed=inSeed.get();

    var pixelStepX=1/realTexture.width;
    var pixelStepY=1/realTexture.height;

    var offsetX=pixelStepX*realTexture.width/2;
    var offsetY=pixelStepY*realTexture.height/2;

    var ind=0;
    var count=0;

    var colChanOffset=0;
    if(zPos.get()=="Green")colChanOffset=1;
        else if(zPos.get()=="Blue")colChanOffset=2;
        else if(zPos.get()=="Alpha")colChanOffset=3;
        else if(zPos.get()=="None")colChanOffset=4;

    while(ind<num*3)
    {
        count++;
        if(count>num*3*100)return;
        var x=Math.floor(Math.seededRandom()*realTexture.width);
        var y=Math.floor(Math.seededRandom()*realTexture.height);
        var intens=pixelData[(x+(y*realTexture.width))*NUM_COL_CHANNELS+colChanOffset];

        if(intens>10)
        {
            points[ind++]=((x*pixelStepX)-(offsetX));
            points[ind++]=((y*pixelStepY)-(offsetY));

            if(colChanOffset<4) points[ind++]=(intens/255);
            else points[ind++]=0;
        }
    }

    // var off=14;
    // var offy=15;
    // var x=0;
    // var y=0;
    // while(ind<num*3)
    // {

    //     count++;
    //     if(count>num*3*100)return;
    //     x+=off;
    //     y+=offy;
    //     if(x>realTexture.width || y>realTexture.height)
    //     {

    //         off=off-(Math.random()*4-2);
    //         offy=offy-(Math.random()*4-2);
    //         x=off;
    //         y=offy;
    //     }

    //     x=Math.abs(Math.floor(x));
    //     y=Math.abs(Math.floor(y));

    //     var intens=pixelData[(x+(y*realTexture.width))*NUM_COL_CHANNELS+colChanOffset];

    //     if(intens>10)
    //     {
    //         points[ind++]=((x*pixelStepX)-(offsetX));
    //         points[ind++]=((y*pixelStepY)-(offsetY));

    //         if(colChanOffset<4) points[ind++]=(intens/255);
    //         else points[ind++]=0;
    //     }
    // }

    outPointsNum.set(ind/3);
    outPoints.set(null);
    outPoints.set(points);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    outTrigger.trigger();
}
