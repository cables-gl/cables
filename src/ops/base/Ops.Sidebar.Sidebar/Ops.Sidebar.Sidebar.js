op.name="Sidebar";

var childs=op.addOutPort(new Port(op,"childs",OP_PORT_TYPE_OBJECT));


var element = document.createElement('div');
element.style["background-color"]="#000";

var canvas = document.getElementById('cablescanvas'); 
if(!canvas)canvas=document.body;

canvas.appendChild(element);

op.childsChanged=function()
{
    childs.set(
        {
            "parent":element,
            "pos":0,
            "level":0,
            "height":25,
            "width":200,
            "padding":5
        });
};

op.setupDiv=function(element,params)
{
    
    var levelSpace=10;
    
    element.style.padding=params.padding+'px';
    element.style.position="absolute";
    element.style.overflow="hidden";
    element.style.cursor="pointer";
    element.style["z-index"]="99999";
    element.style["background-color"]="#222";
    
    element.style['padding-left']=(10+params.level*levelSpace)+"px";
    
    element.style["border-bottom"]="1px solid #444";
    element.style.width=(params.width-params.level*levelSpace)+"px";

    element.style['margin-top']=(params.pos*params.height+params.pos)+"px";

};

childs.onLinkChanged=function()
{
    op.childsChanged();
};

