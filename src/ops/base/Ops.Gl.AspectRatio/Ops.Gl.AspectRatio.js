
var aspects=[
    { title:"1", v:1 },
    { title:"1:2", v:1/2 },
    { title:"5:4", v:5/4 },
    { title:"4:3", v:4/3 },
    { title:"3:2", v:3/2 },
    { title:"11:8", v:11/8 },
    { title:"16:9", v:16/9 },
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
    inCustom=op.inValueFloat("Custom",1.777777),
    blackBars=op.inValueBool("Black Bars");


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
    var _w=cgl.canvasHeight*ratio;
    var _h=cgl.canvasHeight;
    var _x=0;
    var _y=0;
    if(_w>cgl.canvasWidth)
    {
       _w=cgl.canvasWidth;
       _h=cgl.canvasWidth/ratio;
    }

    if(_w<cgl.canvasWidth) _x=(cgl.canvasWidth-_w)/2;
    if(_h<cgl.canvasHeight) _y=(cgl.canvasHeight-_h)/2;


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
    if(blackBars.get())
    {
        cgl.gl.clearColor(0,0,0,1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    }

    resize();
    x=Math.round(x);
    y=Math.round(y);
    w=Math.round(w+0.5);
    h=Math.round(h+0.5);

    cgl.setViewPort(x,y,w,h);

    mat4.perspective(cgl.pMatrix,45, ratio, 0.1, 1100.0);

    trigger.trigger();

};
