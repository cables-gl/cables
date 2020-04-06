var code=op.inStringEditor("css code");

code.setUiAttribs({editorSyntax:'css'});


var styleEle=null;
var eleId='css_'+CABLES.uuid();

code.onChange=update;
update();


function getCssContent()
{
    var css=code.get();
    css = css.replace(/{{ASSETPATH}}/g, op.patch.getAssetPath());
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
