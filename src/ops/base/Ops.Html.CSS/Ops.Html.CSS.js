op.name="CSS";

var inId=op.inValueString("Id","myStyle");
var code=op.addInPort(new Port(op,"css code",OP_PORT_TYPE_VALUE,{display:'editor',editorSyntax:'css'}));

code.onChange=update;
update();

var styleEle=null;


inId.onChange=function()
{
    if(styleEle)styleEle.remove();
    update();
    
};

function getCssContent()
{
    return code.get();
}

function update()
{
    styleEle=document.getElementById(inId.get());

    if(styleEle)
    {
        styleEle.textContent=getCssContent();
    }
    else
    {
        styleEle  = document.createElement('style');
        styleEle.type = 'text/css';
        styleEle.id = inId.get();
        styleEle.textContent=getCssContent();

        var head  = document.getElementsByTagName('body')[0];
        head.appendChild(styleEle);
    }
}

op.onDelete=function()
{
    styleEle=document.getElementById(inId.get());
    if(styleEle)styleEle.remove();
};

