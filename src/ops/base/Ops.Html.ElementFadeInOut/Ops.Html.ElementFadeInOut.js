const inEle=op.inObject("HTML Element");
const inVisible=op.inValueBool("Visible",true);
const inDuration=op.inValue("Duration",0.5);
const inOpacity=op.inValue("Opacity",1);

var theTimeout=null;
inDuration.onChange=update;
inOpacity.onChange=update;

inVisible.onChange=updateVisibility;
var styleEle=null;
var eleId='css_'+CABLES.uuid();

update();

inEle.onChange=updateVisibility;


function updateVisibility()
{
    if(styleEle && inEle.get())
    {
        if(inVisible.get())
        {
            if(!inEle.get().classList.contains('CABLES_animFadeIn'))
            {
                clearTimeout(theTimeout);
                inEle.get().classList.remove("CABLES_animFadedOut");
                inEle.get().classList.remove("CABLES_animFadeOut");
                inEle.get().classList.add("CABLES_animFadeIn");
                theTimeout=setTimeout(function()
                {
                    inEle.get().classList.remove("CABLES_animFadeIn");
                },inDuration.get()*1000);

            }
        }
        else
        {
            if(!inEle.get().classList.contains('CABLES_animFadeOut'))
            {
                inEle.get().classList.remove("CABLES_animFadeIn");
                inEle.get().classList.add("CABLES_animFadeOut");
                theTimeout=setTimeout(function()
                {
                    inEle.get().classList.add("CABLES_animFadedOut");
                },inDuration.get()*1000);
            }
        }
    }
    else
    {
        console.log("fadeInOut: no html element???");
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
