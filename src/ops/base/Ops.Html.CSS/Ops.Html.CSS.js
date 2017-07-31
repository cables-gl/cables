op.name="CSS";

var code=op.addInPort(new Port(op,"css code",OP_PORT_TYPE_VALUE,{display:'editor',editorSyntax:'css'}));

code.onChange=update;
update();

var styleEle=null;

function getCssContent()
{
    return code.get();
}

function update()
{
    op.log("update css!");
    
    styleEle=document.getElementById('mystyle');

    if(styleEle)
    {
        styleEle.textContent=getCssContent();
    }
    else
    {
        styleEle  = document.createElement('style');
        styleEle.type = 'text/css';
        styleEle.id = 'mystyle';
        
        styleEle.textContent=getCssContent();
        
        var head  = document.getElementsByTagName('body')[0];
        head.appendChild(styleEle);
    }

}

