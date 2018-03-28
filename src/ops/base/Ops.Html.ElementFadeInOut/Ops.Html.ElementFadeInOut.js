
var inEle=op.inObject("HTML Element");

var inVisible=op.inValueBool("Visible",true);
var inDuration=op.inValue("Duration",0.5);

var theTimeout=null;
inDuration.onChange=update;

inVisible.onChange=function()
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
    
};




var styleEle=null;
var eleId='css_'+CABLES.uuid();

update();


function getCssContent()
{
    var css=attachments.fadeInOut_css;
    
    while(css.indexOf("$LENGTH")>-1)css=css.replace('$LENGTH',inDuration.get());

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
