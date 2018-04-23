var link=op.addInPort(new Port(op,"link",OP_PORT_TYPE_OBJECT));
var child=op.addOutPort(new Port(op,"childs",OP_PORT_TYPE_OBJECT));
const defaultValue=op.inValue("Default",0.5);

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
var elementSlider=null;

defaultValue.onChange=function()
{
    value.set(defaultValue.get());
    if(elementSlider)elementSlider.value=defaultValue.get()*100;
};

text.onValueChanged=function()
{
    updateText();
};

function updateText()
{
    // if(value.get()) elementSlider.style.color="#bbb";
    //     else elementSlider.style.color="#444";

    textContent.nodeValue=text.get()+' ('+value.get()+')';
}

function init(params)
{
    initialized=true;
    element = document.createElement('div');

    var size=(params.height-params.padding*2);
    elementSlider = document.createElement('input');
    elementSlider.setAttribute("type","range");
    elementSlider.style.display="block";
    elementSlider.style.width="100%";
    elementSlider.style['-webkit-appearance']="none";
    elementSlider.style['border-radius']="4px";
        

    elementSlider.style['background-color']="#888";
    elementSlider.style.color="#fff";
    elementSlider.style.border="none";
    
    // elementSlider.style['font-size']="25px";
    // elementSlider.style.height=size+"px";
    // elementSlider.style['margin-top']="20px";


    element.style['font-family']="monospace";
    element.style['user-select']="none";

    element.appendChild(textContent);
    element.appendChild(document.createElement('br'));
    // elementSlider.appendChild(textContentValue);
    element.appendChild(elementSlider);

    updateText();
    
    params.parent.appendChild(element);
    
    elementSlider.value=defaultValue.get()*100;

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
