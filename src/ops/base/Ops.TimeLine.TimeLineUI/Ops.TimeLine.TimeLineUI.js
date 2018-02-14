


var cgl=op.patch.cgl;



var div = document.createElement('div');
div.style.padding="10px";
div.style.position="absolute";
div.style.overflow="hidden";
div.style['box-sizing']="border-box";
// div.style.border="1px solid red";
div.style['border-radius']="10px";
div.style['background-color']="rgba(0,0,0,0.45)";
// div.style['border-left']="1px solid blue";
// div.style['border-top']="1px solid green";
div.style["z-index"]="9999";

div.style.margin="20px";
div.style.width="250px";
div.style.height="85px";
div.style.bottom="10px";

var canvas = op.patch.cgl.canvas.parentElement;
canvas.appendChild(div);

function addButton(title)
{
    var button = document.createElement('div');
    button.innerHTML=title;
    button.style.cursor="pointer";
    button.style['box-sizing']="border-box";
    button.style.float="left";
    // button.style.border="1px solid #777";
    button.style.background='rgba(0,0,0,0.4)';

    button.style.padding="5px";
    button.style['padding-left']="10px";
    button.style['padding-right']="10px";
    button.style['margin-right']="5px";
    button.style['border-radius']="5px";
    return button;
}

var time = document.createElement('div');
time.innerHTML='0';
// time.style.float="left";
div.appendChild(time);


var timelineContainer = document.createElement('div');
timelineContainer.style.width='100%';
timelineContainer.style.height='5px';
timelineContainer.style['margin-bottom']='8px';
timelineContainer.style['margin-top']='8px';
timelineContainer.style.overflow='hidden';
timelineContainer.style.background='rgba(0,0,0,0.4)';
timelineContainer.style['border-radius']='4px';

var timeline = document.createElement('div');
// timeline.style.width='50%';
timeline.style.height='100%';
timeline.style.background='rgba(110,110,110,0.7)';

timelineContainer.appendChild(timeline);
div.appendChild(timelineContainer);


var playButton=addButton('play');
div.appendChild(playButton);


var rewindButton=addButton('rewind');
div.appendChild(rewindButton);



updatePlayButton();




function updatePlayButton()
{
    if(op.patch.timer.isPlaying())
    {
        playButton.innerHTML='pause';
    }
    else
    {
        playButton.innerHTML='play';        
    }
}


playButton.addEventListener('click',function()
{

    if(op.patch.timer.isPlaying())
    {
        op.patch.timer.pause();
    }
    else
    {
        op.patch.timer.play();
    }

    updatePlayButton();
});

rewindButton.addEventListener('click',function()
{
    op.patch.timer.setTime(0);
});


op.onDelete=function()
{
    if(div) div.remove();
};

var lasttime=-1;

function updateTime()
{
    
    if(CABLES.GUI && window.gui)
    {
        var p=op.patch.timer.getTime()/gui.timeLine().getTimeLineLength();
        timeline.style.width=(p*100)+'%';
    }
    
    var t=Math.round(op.patch.timer.getTime());
    if(t!=lasttime)
    {
        time.innerHTML=t;
        lasttime=t;
    }

    setTimeout(updateTime,30);
}

updateTime();

