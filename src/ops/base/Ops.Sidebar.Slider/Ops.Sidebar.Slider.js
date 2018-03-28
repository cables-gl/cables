var link=op.addInPort(new Port(op,"link",OP_PORT_TYPE_OBJECT));
var child=op.addOutPort(new Port(op,"childs",OP_PORT_TYPE_OBJECT));

var value=op.outValue("Result");
var text=op.addInPort(new Port(op,"Text",OP_PORT_TYPE_VALUE,{type:'string'}));

value.set(0.5);
text.set('Slider');

var textContent = document.createTextNode(text.get()); 
var textContentValue= document.createTextNode(text.get()); 
var element=null;
var initialized=false;

op.onDelete=remove;
child.onLinkChanged=updateSidebar;
link.onLinkChanged=updateSidebar;
link.onValueChanged=updateParams;
var elementCheckBox=null;

text.onValueChanged=function()
{
    textContent.nodeValue=text.get();
};

function updateText()
{
    if(value.get()) elementCheckBox.style.color="#bbb";
        else elementCheckBox.style.color="#444";

    textContent.nodeValue=text.get();
}

function init(params)
{
    initialized=true;
    element = document.createElement('div');

    var size=(params.height-params.padding*2);
    elementCheckBox = document.createElement('input');
    elementCheckBox.setAttribute("type","range");
    elementCheckBox.style.display="block";
    elementCheckBox.style.width="100%";
    // elementCheckBox.style['font-size']="25px";
    // elementCheckBox.style.height=size+"px";
    // elementCheckBox.style['margin-top']="20px";


    element.style['font-family']="monospace";
    element.style['user-select']="none";

    element.appendChild(textContent);
    element.appendChild(document.createElement('br'));
    // elementCheckBox.appendChild(textContentValue);
    element.appendChild(elementCheckBox);

    updateText();
    
    params.parent.appendChild(element);

    element.addEventListener("input",function(e)
    {
        // console.log(e.target.value);
        value.set(e.target.value/100);
        updateText();
    });
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
