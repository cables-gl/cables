const
    fftArr=op.inArray("FFT Array"),
    refresh=op.inTriggerButton("refresh"),
    x=op.inValueSlider("x"),
    y=op.inValueSlider("y"),
    w=op.inValueSlider("width",0.2),
    h=op.inValueSlider("height",0.2),
    texOut=op.outTexture("texture_out"),
    value=op.outValue("value");

const cgl=op.patch.cgl;
var data=[];
var line=0;
var size=128;

const canvas = document.createElement('canvas');
canvas.id = "fft_"+CABLES.uuid();
canvas.width = canvas.height = size;
canvas.style.display = "none";
var body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);
const ctx = canvas.getContext('2d');

var areaX=0;
var areaY=0;
var areaW=20;
var areaH=20;
var amount=0;

refresh.onTriggered=function()
{
    var arr=fftArr.get();
    if(!arr)return;
    var width=arr.length;

    ctx.beginPath();
    ctx.fillStyle="#000";
    ctx.strokeStyle="#ff0";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#888";
    for(var i=0;i<arr.length;i++)
        ctx.fillRect(i,size-arr[i],1,arr[i]);

    areaX=x.get()*canvas.width;
    areaY=y.get()*canvas.height;

    areaW=w.get()*size/2;
    areaH=h.get()*size/2;

    ctx.rect(areaX,areaY,areaW,areaH);
    ctx.stroke();

    var val=0;
    var count=0;
    for(var xc=areaX;xc<areaX+areaW;xc++)
        for(var yc=areaY;yc<areaY+areaH;yc++)
            if(arr[Math.round(xc)]>size-yc)count++;

    if(amount!=amount)amount=0;
    amount=amount+count/(areaW*areaH);
    amount/=2;
    value.set(amount);

    ctx.fillStyle="#ff0";
    ctx.fillRect(0,0,amount*canvas.width,5);


    if(texOut.get()) texOut.get().initTexture(canvas,CGL.Texture.FILTER_NEAREST);
        else texOut.set(new CGL.Texture.createFromImage( cgl, canvas, { "filter":CGL.Texture.FILTER_NEAREST } ));

};
