
var aspects=[
    { title:"1:2", v:1/2 },
    { title:"1", v:1 },
    { title:"5:4", v:5/4 },
    { title:"4:3", v:4/3 },
    { title:"3:2", v:3/2 },
    { title:"11:8", v:11/8 },
    { title:"16:9", v:16/9 },
    { title:"2:1", v:2 },
    { title:"21:9", v:21/9 },
    { title:"custom", v:0 },
    ];
var aspectTitles=[];
for(var i=0;i<aspects.length;i++) aspectTitles.push(aspects[i].title);

const
    render=op.inTrigger('render'),
    trigger=op.outTrigger('trigger'),
    outWidth=op.outValue("Width"),
    outHeight=op.outValue("Height"),
    inAspect=op.inValueSelect('Aspect Ratio',aspectTitles,aspects[0].title),
    inCustom=op.inValueFloat("Custom",1.777777);

const
    useVPSize=op.inValueBool("use viewport size",true),
    width=op.inValueInt("texture width",512),
    height=op.inValueInt("texture height",512);

op.setPortGroup("Size",[useVPSize,width,height]);
useVPSize.onChange=updateVpSize;
function updateVpSize()
{
    width.setUiAttribs({greyout:useVPSize.get()});
    height.setUiAttribs({greyout:useVPSize.get()});
}

const prevViewPort=[];
const cgl=op.patch.cgl;
var w=1000,h=1000,x,y;
var ratio=1;

inAspect.onChange=changedRatio;
inCustom.onChange=changedRatio;

changedRatio();

function changedRatio()
{
    var selected=inAspect.get();
    if(selected=='custom')
    {
        if(inCustom.uiAttribs.greyout) inCustom.setUiAttribs({greyout:false});
        ratio=Math.abs(inCustom.get());
    }
    else
    {
        if(!inCustom.uiAttribs.greyout) inCustom.setUiAttribs({greyout:true});

        for(var i=0;i<aspects.length;i++)
        {
            if(aspects[i].title==selected)
            {
                ratio=aspects[i].v;
                break;
            }
        }
    }
}


function resize()
{

    var theWidth=cgl.canvasWidth;
    var theHeight=cgl.canvasHeight;

    if(!useVPSize.get())
    {
        theWidth=width.get();
        theHeight=height.get();
    }

    var _w=theHeight*ratio;
    var _h=theHeight;
    var _x=0;
    var _y=0;
    if(_w>theWidth)
    {
       _w=theWidth;
       _h=theWidth/ratio;
    }

    if(_w<theWidth) _x=(theWidth-_w)/2;
    if(_h<theHeight) _y=(theHeight-_h)/2;


    _w=Math.ceil(_w);
    _h=Math.ceil(_h);
    _x=Math.ceil(_x);
    _y=Math.ceil(_y);

    if(_w!=w || _h!=h || _x!=x ||_y!=y)
    {
        w=_w;
        h=_h;
        x=_x;
        y=_y;

        cgl.setViewPort(x,y,w,h);

        for(var i=0;i<op.patch.ops.length;i++)
            if(op.patch.ops[i].onResize)op.patch.ops[i].onResize();
    }

    outWidth.set(w);
    outHeight.set(h);
}

op.onDelete=function()
{
    cgl.resetViewPort();
};

render.onTriggered=function()
{
    var vp=cgl.getViewPort();
    prevViewPort[0]=vp[0];
    prevViewPort[1]=vp[1];
    prevViewPort[2]=vp[2];
    prevViewPort[3]=vp[3];

    resize();
    x=Math.ceil(x);
    y=Math.ceil(y);
    w=Math.ceil(w);
    h=Math.ceil(h);

    cgl.setViewPort(x,y,w,h);

    mat4.perspective(cgl.pMatrix,45, ratio, 0.1, 1100.0);

    trigger.trigger();

    cgl.setViewPort(prevViewPort[0],prevViewPort[1],prevViewPort[2],prevViewPort[3]);
};
