const
    src=op.inString("Video Id",'dQw4w9WgXcQ'),
    active=op.inBool("Active",true),
    inStyle=op.inStringEditor("Style"),
    elId=op.inString("ElementID"),
    paramAutoplay=op.inBool("Autoplay",false),
    paramCC=op.inBool("Display Captions",false),
    paramLoop=op.inBool("Loop",false),
    paramFs=op.inBool("Allow Fullscreen",true),
    paramControls=op.inBool("Hide Controls",false),
    paramStart=op.inInt("Start at Second",0),

    outEle=op.outObject("Element"),
    outDirectLink=op.outString("Direct Link");
    // outImageMax=op.outString("Thumbnail Max");

const defaultStyle='position:absolute;\n\
z-index:9;\n\
border:0;\n';

op.setPortGroup("Youtube Options",[paramAutoplay,paramCC,paramLoop,paramFs,paramControls,paramStart]);

// https://developers.google.com/youtube/player_parameters


var element=null;

paramStart.onChange=
    paramAutoplay.onChange=
    paramCC.onChange=
    paramLoop.onChange=
    paramFs.onChange=
    paramControls.onChange=
    src.onChange=updateURL;

elId.onChange=updateID;
inStyle.onChange=updateStyle;
active.onChange=update;
op.onDelete=removeEle;
op.onLoaded=update;
op.init=update;

inStyle.set(defaultStyle);

function update()
{
    console.log("loaded!",active.get());
    if(!active.get())
    {
        removeEle();
        return;
    }

    addElement();
}


function addElement()
{
    if(element) removeEle();

    var canvas = op.patch.cgl.canvas.parentElement;
    element = document.createElement('iframe');
    element.dataset.op=op.id;
    element.style.position="absolute";
    element.allowfullscreen=true;
    element.frameborder=0;
    element.allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";

    canvas.appendChild(element);

    outEle.set(element);

    updateURL();
    updateID();
    updateStyle();
}

function removeEle()
{
    if(element) element.parentNode.removeChild(element);
    element=null;
}


function updateURL()
{
    var urlParams=[];

    if(paramAutoplay.get()) urlParams.push('autoplay=1');
    if(paramCC.get()) urlParams.push('cc_load_policy=1');
    if(paramLoop.get()) urlParams.push('loop=1');
    if(paramFs.get()) urlParams.push('fs=1');
    if(paramControls.get()) urlParams.push('controls=0');
    if(paramStart.get()>0) urlParams.push('start='+paramStart.get());


    var urlParamsStr='';
    if(urlParams.length>0) urlParamsStr='?'+urlParams.join('&');

    const urlStr='https://www.youtube.com/embed/'+src.get()+urlParamsStr;
    console.log(urlStr);
    if(element) element.setAttribute('src',urlStr);

    outDirectLink.set("https://www.youtube.com/watch?v="+src.get());



}

function updateID()
{
    if(element) element.setAttribute('id',elId.get());
}

function updateStyle()
{
    if(element) element.style=inStyle.get();
}
