const
    inTrigger=op.inTrigger("Trigger"),
    inActive=op.inBool("Active",true),
    inWhat=op.inSwitch("Force",['Resolution','Aspect Ratio'],'Resolution'),
    inCenter=op.inBool("Center In Parent",true),
    inWidth=op.inInt("Width",300),
    inHeight=op.inInt("Height",200),
    inPresets=op.inDropDown("Aspect Ratio",['21:9','2:1','16:9','16:10','4:3','1:1','9:16','1:2','iPhoneXr Vert'],'16:9'),
    inRatio=op.inFloat("Ratio",0),
    inStretch=op.inDropDown("Fill Parent",['Auto','Width','Height','Both'],'Auto'),
    next=op.outTrigger("Next"),
    outWidth=op.outNumber("Width"),
    outHeight=op.outNumber("Height");

op.setPortGroup("Size",[inWidth,inHeight]);
op.setPortGroup("Proportions",[inRatio,inStretch,inPresets]);

var align=0;
const ALIGN_NONE=0;
const ALIGN_WIDTH=1;
const ALIGN_HEIGHT=2;
const ALIGN_BOTH=3;
const ALIGN_AUTO=4;

inStretch.onChange=
inWhat.onChange=updateUi;

inCenter.onChange=
inTrigger.onLinkChanged=removeStyles;


inPresets.onChange=function()
{
    const pr=inPresets.get();
    if(pr=='16:9')inRatio.set(16/9);
    else if(pr=='4:3')inRatio.set(4/3);
    else if(pr=='16:10')inRatio.set(16/10);
    else if(pr=='21:9')inRatio.set(21/9);
    else if(pr=='2:1')inRatio.set(2);
    else if(pr=='1:1')inRatio.set(1);
    else if(pr=='9:16')inRatio.set(9/16);
    else if(pr=='1:2')inRatio.set(0.5);
    else if(pr=='iPhoneXr Vert')inRatio.set(9/19.5);

};

const cgl=op.patch.cgl;

updateUi();

inActive.onChange=function()
{
    if(!inActive.get())removeStyles();
}

function updateUi()
{
    const forceRes=inWhat.get()=='Resolution';
    inWidth.setUiAttribs({greyout:!forceRes});
    inHeight.setUiAttribs({greyout:!forceRes});

    inPresets.setUiAttribs({greyout:forceRes});
    inStretch.setUiAttribs({greyout:forceRes});
    inRatio.setUiAttribs({greyout:forceRes});

    align=0;

    if(!forceRes)
    {
        const strAlign=inStretch.get();
        if(strAlign=="Width")align=ALIGN_WIDTH;
        else if(strAlign=="Height")align=ALIGN_HEIGHT;
        else if(strAlign=="Both")align=ALIGN_BOTH;
        else if(strAlign=="Auto")align=ALIGN_AUTO;
    }
}

function removeStyles()
{
    cgl.canvas.style['margin-top']='';
    cgl.canvas.style['margin-left']='';

    const rect=cgl.canvas.parentNode.getBoundingClientRect();
    cgl.setSize(rect.width,rect.height);
}


inTrigger.onTriggered=function()
{
    if(!inActive.get()) return next.trigger();

    let w=inWidth.get();
    let h=inHeight.get();

    if(align==ALIGN_WIDTH)
    {
        w=cgl.canvas.parentNode.getBoundingClientRect().width;
        h=w*1/inRatio.get();
    }
    else if(align==ALIGN_HEIGHT)
    {
        h=cgl.canvas.parentNode.getBoundingClientRect().height;
        w=h*inRatio.get();
    }
    else if(align==ALIGN_AUTO)
    {
        const rect=cgl.canvas.parentNode.getBoundingClientRect();

        h=rect.height;
        w=h*inRatio.get();

        if(w>rect.width)
        {
            w=rect.width;
            h=w*1/inRatio.get();
        }
    }
    else if(align==ALIGN_BOTH)
    {
        const rect=cgl.canvas.parentNode.getBoundingClientRect();
console.log("both rect",rect);
        h=rect.height;
        w=h*inRatio.get();

        if(w<rect.width)
        {
            w=rect.width;
            h=w*1/inRatio.get();
        }
    }

    w=Math.floor(w);
    h=Math.floor(h);

    if(inCenter.get())
    {
        const rect=cgl.canvas.parentNode.getBoundingClientRect();
        cgl.canvas.style['margin-top']=(rect.height-h)/2+"px";
        cgl.canvas.style['margin-left']=(rect.width-w)/2+"px";
    }

    if(cgl.canvas.width!=w || cgl.canvas.height!=h)
    {
        outWidth.set(w);
        outHeight.set(h);
        cgl.setSize(w,h);
    }
    else next.trigger();

};
