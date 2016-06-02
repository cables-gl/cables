op.name="ClusterLabel";


var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var num=op.addInPort(new Port(op,"Index",OP_PORT_TYPE_VALUE));
var reset=op.addInPort(new Port(op,"reset",OP_PORT_TYPE_VALUE));

var elements=[];
var m=mat4.create();
var trans=mat4.create();
var cgl=op.patch.cgl;

reset.onValueChanged=function()
{
    for(var i in elements)
    {
        elements[i].style.opacity=0;
    }
};

op.onDelete=function()
{
    for(var i in elements)
    {
        elements[i].remove();
    }

}

render.onTriggered=function()
{

    var pos=[0,0,0];
    mat4.multiply(m,cgl.vMatrix,cgl.mvMatrix);
    vec3.transformMat4(pos, [0,0,0], m);

    vec3.transformMat4(trans, pos, cgl.pMatrix);
    
    var x=cgl.getViewPort()[2]-( cgl.getViewPort()[2]  * 0.5 - trans[0] * cgl.getViewPort()[2] * 0.5 / trans[2] );
    var y=cgl.getViewPort()[3]-( cgl.getViewPort()[3]  * 0.5 + trans[1] * cgl.getViewPort()[3] * 0.5 / trans[2] );

    if(num.get()>elements.length-1)
    {
        var element = document.createElement('div');

        element.style.padding="10px";
        element.style.position="absolute";
        element.style.overflow="hidden";
        element.style["z-index"]="99999";
        element.style["pointer-events"]="none";
        element.style['font-size']="18px";
        element.style.height="auto";
        element.style.color="#fff";
        element.style.width="auto";
        element.style['text-shadow']="0px 0px 9px rgba(0, 0, 0, 1)";


        var textContent = document.createTextNode("Example "+(elements.length+1));
        element.appendChild(textContent);

        var canvas = document.getElementById("cablescanvas") || document.body; 
        canvas.appendChild(element);

        elements.push(element);
    }

    var ele=elements[num.get()];
    
    ele.style.opacity=1;

    ele.style['margin-left']=(x-ele.clientWidth/2)+"px";
    ele.style['margin-top']=(y-ele.clientHeight/2)+"px";



    
};
