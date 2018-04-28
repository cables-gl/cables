const link=op.inObject("link");
const child=op.addOutPort(new Port(op,"childs",OP_PORT_TYPE_OBJECT));

const value=op.addOutPort(new Port(op,"Value",OP_PORT_TYPE_VALUE,{type:'bool'}));
const text=op.inValueString("Text","");

var defaultValue=op.inValueBool("Default",true);

value.set(false);

var textContent = document.createTextNode(text.get()); 
var textContentValue= document.createTextNode(text.get()); 
var element=null;
var initialized=false;

op.onDelete=remove;
child.onLinkChanged=updateSidebar;
link.onLinkChanged=updateSidebar;
link.onValueChanged=updateParams;
var elementCheckBox=null;

defaultValue.onChange=function()
{
    value.set(defaultValue.get());
    updateText();
};

text.onChange=function()
{
    textContent.nodeValue=text.get();
    updateText();
};

function updateText()
{
    if(elementCheckBox)
    {
        if(value.get()) elementCheckBox.style.color="#bbb";
            else elementCheckBox.style.color="#444";
    
        textContent.nodeValue=text.get();
        textContentValue.nodeValue='●';
    }
    if(CABLES.UI)op.setTitle('Toggle '+text.get());

}

function init(params)
{
    initialized=true;
    element = document.createElement('div');

    var size=(params.height-params.padding*2);
    elementCheckBox = document.createElement('div');
    elementCheckBox.style.float="right";
    elementCheckBox.style.width=size+"px";
    elementCheckBox.style['font-size']="25px";
    elementCheckBox.style.height=size+"px";
    elementCheckBox.style['margin-top']="-7px";


    element.style['font-family']="monospace";
    element.style['user-select']="none";

    element.appendChild(textContent);
    elementCheckBox.appendChild(textContentValue);
    element.appendChild(elementCheckBox);

    updateText();
    
    params.parent.appendChild(element);

    element.onclick=function()
    {
        value.set(!value.get());
        updateText();
    };
    
    value.set(defaultValue.get());
    updateText();

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
