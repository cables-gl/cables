const link=op.inObject("link");
const child=op.outObject("childs");
const text=op.inValueString("Text",'');
const defaultValue=op.inValue("Default",0.5);
const min=op.inValue("Min",0);
const max=op.inValue("Max",1);
const value=op.outValue("Result");

var textContent = document.createTextNode(text.get()); 
var textContentValue= document.createTextNode(text.get()); 
var element=null;
var initialized=false;

min.onChange=updateMinMax;
max.onChange=updateMinMax;

op.onDelete=remove;
child.onLinkChanged=updateSidebar;
link.onLinkChanged=updateSidebar;
link.onValueChanged=updateParams;
var elementSlider=null;

defaultValue.onChange=updateValue;

updateValue();

function updateValue()
{
    value.set(defaultValue.get());
    if(elementSlider)elementSlider.value=defaultValue.get()*100;
}

text.onValueChanged=function()
{
    updateText();
};

function updateMinMax()
{
    if(elementSlider)
    {
        elementSlider.setAttribute("min",min.get()*100);
        elementSlider.setAttribute("max",max.get()*100);
    }
}

function updateText()
{
    textContent.nodeValue=text.get()+' ('+value.get()+')';
    if(CABLES.UI)op.setTitle('Slider '+text.get());
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

    element.style['font-family']="monospace";
    element.style['user-select']="none";

    element.appendChild(textContent);
    element.appendChild(document.createElement('br'));
    element.appendChild(elementSlider);

    updateText();
    updateMinMax();
    
    params.parent.appendChild(element);
    
    elementSlider.value=defaultValue.get()*100;

    element.addEventListener("input",function(e)
    {
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
