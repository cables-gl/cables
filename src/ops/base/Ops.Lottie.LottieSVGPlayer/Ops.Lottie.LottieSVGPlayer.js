const
    inEle=op.inObject("HTML Element"),
    inData=op.inObject("JSON Data"),
    inPlay=op.inValueBool("Play",true),
    inLoop=op.inValueBool("Loop",true);

inPlay.onChange=inLoop.onChange=inEle.onChange=inData.onChange=updateData;

var anim=null;

function dispose()
{
    if(anim)
    {
        anim.destroy();
        anim=null;
    }
}

function updateData()
{
    if(anim)dispose();
    if(!inEle.get() || !inData.get())return;

    var params = {
        container: inEle.get(),
        renderer: 'svg',
        loop: inLoop.get(),
        autoplay: inPlay.get(),
        animationData: inData.get()
    };

    anim = lottie.loadAnimation(params);
}


