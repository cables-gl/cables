var link=op.addInPort(new Port(op,"link",OP_PORT_TYPE_OBJECT));
var child=op.addOutPort(new Port(op,"childs",OP_PORT_TYPE_OBJECT));

var trigger=op.outFunction("Pressed Trigger");
var text=op.addInPort(new Port(op,"Text",OP_PORT_TYPE_VALUE,{type:'string'}));

text.set('Sidebar Button');

var element=null;
var initialized=false;

op.onDelete=remove;
child.onLinkChanged=updateSidebar;
link.onLinkChanged=updateSidebar;
link.onValueChanged=updateParams;
var elementButton=null;

text.onValueChanged=updateText;

function updateText()
{
    elementButton.setAttribute("value",text.get());
}

function init(params)
{
    initialized=true;
    element = document.createElement('div');

    var size=(params.height-params.padding*2);
    elementButton = document.createElement('input');
    elementButton.setAttribute("type","button");
    elementButton.setAttribute("value",text.get());

    element.style['font-family']="monospace";
    element.style['user-select']="none";

    element.appendChild(elementButton);

    updateText();
    
    params.parent.appendChild(element);

    element.onclick=function()
    {
        trigger.trigger();
    };
}

function remove()
{
    initialized=false;
    if(element) element.remove();
}

function updateSidebar()
{
    if(!link.isLinked()) remove();        
    var sidebar=op.findParent('Ops.Sidebar.Sidebar');
    if(sidebar)sidebar.childsChanged();
}

function updateParams()
{
    var params=link.get();
    if(!params)return;

    if(params.hide) remove(); 
    else
    {
        if(!initialized) init(params);
        var sidebar=op.findParent('Ops.Sidebar.Sidebar');
        if(sidebar) sidebar.setupDiv(element,params);
    
        params.pos++;    
    }
    child.set(params);

}
