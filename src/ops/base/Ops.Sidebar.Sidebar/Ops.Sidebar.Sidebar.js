op.name="Sidebar";

var childs=op.addOutPort(new Port(op,"childs",OP_PORT_TYPE_OBJECT));


var element = document.createElement('div');
element.style["background-color"]="#000";

var canvas = document.getElementById("cablescanvas"); 
canvas.appendChild(element);

op.childsChanged=function()
{
    childs.set(
        {
            "parent":element,
            "pos":0,
            "height":25,
            "width":200,
            "padding":5
        });
};

childs.onLinkChanged=function()
{
    op.childsChanged();
};

