var link=op.addInPort(new Port(op,"link",OP_PORT_TYPE_OBJECT));
var child=op.addOutPort(new Port(op,"childs",OP_PORT_TYPE_OBJECT));

var text=op.addInPort(new Port(op,"Text",OP_PORT_TYPE_VALUE,{type:'string'}));
var inValue=op.inValue("Value");


text.set('Display value');

var textContent = document.createTextNode(text.get()); 
var element=null;
var initialized=false;

op.onDelete=remove;
child.onLinkChanged=updateSidebar;
link.onLinkChanged=updateSidebar;
link.onValueChanged=updateParams;
var elementValue=null;
text.onValueChanged=updateText;

inValue.onChange=function()
{
    if(elementValue)elementValue.innerHTML=inValue.get();
};


function updateText()
{
    textContent.nodeValue=text.get();
}

function init(params)
{
    initialized=true;
    element = document.createElement('div');

    var size=(params.height-params.padding*2);
    elementValue = document.createElement('div');
    elementValue.style.color="white";


    element.style['font-family']="monospace";
    element.style['user-select']="none";

    element.appendChild(textContent);
    element.appendChild(elementValue);

    updateText();
    
    params.parent.appendChild(element);
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
