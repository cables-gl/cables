var size=op.inValue("size",40);
var opacity=op.inValue("Opacity",0.5);

var element = document.createElement('div');

size.onChange=function()
{
    element.style.width=size.get()+"px";
    element.style.height=size.get()+"px";
};

opacity.onChange=function()
{
    element.style.opacity=opacity.get();
};

element.style.padding="10px";
element.style="cableslink";
element.style.position="absolute";
element.style.right="0px";
element.style.bottom="0px";
element.style.width="40px";
element.style.height="40px";
element.style.opacity="0.4";
element.style.cursor="pointer";
element.style["background-image"]="url(https://cables.gl/img/cables-logo.svg)";
element.style["z-index"]="9999";
element.style["background-size"]="80%";
element.style["background-repeat"]="no-repeat";

var canvas = op.patch.cgl.canvas.parentElement;
canvas.appendChild(element);

element.addEventListener("click", function()
{
    document.location.href="https://cables.gl";
});

op.onDelete=function()
{
    element.remove();
};