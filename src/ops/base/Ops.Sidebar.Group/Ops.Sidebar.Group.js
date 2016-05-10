op.name="Group";

var link=op.addInPort(new Port(op,"link",OP_PORT_TYPE_OBJECT));
var text=op.addInPort(new Port(op,"Text",OP_PORT_TYPE_VALUE,{type:'string'}));

var next=op.addOutPort(new Port(op,"next",OP_PORT_TYPE_OBJECT));
var childs=op.addOutPort(new Port(op,"childs",OP_PORT_TYPE_OBJECT));

text.set('Group');

var textContent = document.createTextNode(text.get()); 
var opened=true;
var element=null;
var initialized=false;

op.onDelete=remove;
childs.onLinkChanged=updateSidebar;
next.onLinkChanged=updateSidebar;
link.onLinkChanged=updateSidebar;
link.onValueChanged=updateParams;

text.onValueChanged=function()
{
    textContent.nodeValue=text.get();
};

function updateText()
{
    textContent.nodeValue=text.get();
}

function init(params)
{
    initialized=true;
    element = document.createElement('div');
    element.style.color="#eee";

    element.appendChild(textContent);

    updateText();
    
    params.parent.appendChild(element);

    element.onclick=function()
    {
        opened=!opened;
        updateSidebar();
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
    if(sidebar) sidebar.childsChanged();
}

function updateParams()
{
    var params=link.get();

    if(!initialized) init(params);

    var sidebar=op.findParent('Ops.Sidebar.Sidebar');

    if(sidebar) sidebar.setupDiv(element,params);

    if(params.hide) remove();
        else params.pos++;

    if(!params.hide) params.hide=!opened;
    params.level++;
    childs.set(params);
    params.level--;

    params.hide=false;

    next.set(params);
}
