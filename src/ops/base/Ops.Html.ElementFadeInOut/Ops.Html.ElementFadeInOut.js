const inEle=op.inObject("HTML Element");
const inVisible=op.inValueBool("Visible",true);
const inDuration=op.inValue("Duration",0.5);
const inOpacity=op.inValue("Opacity",1);


const outShowing=op.outValueBool("Is Showing",false);
var theTimeout=null;
inDuration.onChange=update;
inOpacity.onChange=update;

inVisible.onChange=updateVisibility;
inEle.onChange=updateVisibility;

var styleEle=null;
var eleId='css_'+CABLES.uuid();

update();

var loaded=false;
var oldvis=null;

op.onLoaded=function()
{
    loaded=true;

    updateVisibility();
    outShowing.set(inVisible.get());

};

function updateVisibility()
{
    const ele=inEle.get();
    if(!loaded)
    {
        return;
    }

    if(styleEle && ele)
    {
        if(inVisible.get())
        {
            outShowing.set(true);
            if(!ele.classList.contains('CABLES_animFadeIn'))
            {

                clearTimeout(theTimeout);
                ele.classList.remove("CABLES_animFadedOut");
                ele.classList.remove("CABLES_animFadeOut");
                ele.classList.add("CABLES_animFadeIn");
                theTimeout=setTimeout(function()
                    {
                        ele.classList.remove("CABLES_animFadeIn");
                        outShowing.set(true);
                    },inDuration.get()*1000);

            }
        }
        else
        {
            outShowing.set(true);
            if(!ele.classList.contains('CABLES_animFadeOut'))
            {

                clearTimeout(theTimeout);
                ele.classList.remove("CABLES_animFadeIn");
                ele.classList.add("CABLES_animFadeOut");
                theTimeout=setTimeout(function()
                    {
                        ele.classList.add("CABLES_animFadedOut");
                        outShowing.set(false);
                    },inDuration.get()*1000);
            }
        }
    }
    else
    {
        // console.log("fadeInOut: no html element???");
    }
}


function getCssContent()
{
    var css=attachments.fadeInOut_css;

    while(css.indexOf("$LENGTH")>-1)css=css.replace('$LENGTH',inDuration.get());
    while(css.indexOf("$FULLOPACITY")>-1)css=css.replace('$FULLOPACITY',inOpacity.get());

    return css;
}

function update()
{
    styleEle=document.getElementById(eleId);

    if(styleEle)
    {
        styleEle.textContent=getCssContent();
    }
    else
    {
        styleEle  = document.createElement('style');
        styleEle.type = 'text/css';
        styleEle.id = eleId;
        styleEle.textContent=getCssContent();

        var head  = document.getElementsByTagName('body')[0];
        head.appendChild(styleEle);
    }
}

op.onDelete=function()
{
    styleEle=document.getElementById(eleId);
    if(styleEle)styleEle.remove();
};
