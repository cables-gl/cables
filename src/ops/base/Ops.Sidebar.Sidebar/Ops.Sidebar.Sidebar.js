
var childs=op.addOutPort(new Port(op,"childs",OP_PORT_TYPE_OBJECT));
var inVisible=op.inValueBool("Visible",true);
var inOpacity=op.inValueSlider("Opacity",1);
var element = document.createElement('div');
element.style["background-color"]="#000";
element.style["z-index"]="99999";
element.style.position="absolute";
element.style.width="200px";
element.style.top="0px";
// element.style["margin-left"]="-200px";

var canvas = document.getElementById('cablescanvas'); 
if(!canvas)canvas=document.body;

canvas.appendChild(element);

inOpacity.onChange=function()
{
    element.style.opacity=inOpacity.get();
};

inVisible.onChange=function()
{
    if(inVisible.get())element.style.display="block";
        else element.style.display="none";
};

op.childsChanged=function()
{
    childs.set(
        {
            "parent":element,
            "pos":0,
            "level":0,
            // "min-height":'25px',
            "width":200,
            "padding":5
        });
};

op.setupDiv=function(element,params)
{
    if(!element || !params)return;
    var levelSpace=10;
    
    
    // var h=element.offsetHeight;
    
    element.style.padding=params.padding+'px';
    // element.style.position="absolute";
    element.style.overflow="hidden";
    element.style.cursor="pointer";
    element.style.float="left";
    element.style.clear="both";
    
    element.style["min-height"]="25px";
    element.style["background-color"]="#222";
    
    element.style['padding-left']=(10+params.level*levelSpace)+"px";
    
    element.style["border-bottom"]="1px solid #444";
    element.style.width=(params.width-params.level*levelSpace)+"px";

    // element.style['margin-top']=(params.pos*h+params.pos)+"px";

};

childs.onLinkChanged=function()
{
    op.childsChanged();
};

