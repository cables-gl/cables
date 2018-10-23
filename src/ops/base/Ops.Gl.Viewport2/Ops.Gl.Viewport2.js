
var render=op.addInPort(new Port(op,"render",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION));


var ratio=op.addInPort(new Port(op,"ratio",CABLES.OP_PORT_TYPE_VALUE ,{display:'dropdown',values:[0.5,0.5625,0.75,1,1.25,1.3333333333,1.777777777778,2.33333333333333,3,4]} ));
ratio.set(1.777777777778);

var posX=op.inValueSelect("Pos X",["Left","Right","Center"],"Center");

var cgl=op.patch.cgl;

var w=1000,h=1000;

function resize()
{
    var _w=cgl.canvasHeight*ratio.get();
    var _h=cgl.canvasHeight;
    var _x=0;
    var _y=0;

    if(_w>cgl.canvasWidth)
    {
       _w=cgl.canvasWidth;
       _h=cgl.canvasWidth/ratio.get();
    }

    if(_w<cgl.canvasWidth) _x=(cgl.canvasWidth-_w)/2;
    if(_h<cgl.canvasHeight) _y=(cgl.canvasHeight-_h)/2;


    if(_w!=w || _h!=h)
    {
        w=_w;
        h=_h;

        var vp=cgl.getViewPort();

        // cgl.setViewPort(0,vp[2]-h,w,h);

        for(var i=0;i<op.patch.ops.length;i++)
        {
            if(op.patch.ops[i].onResize)op.patch.ops[i].onResize();
        }
    }
}

op.onDelete=function()
{
    cgl.resetViewPort();
};

render.onTriggered=function()
{
    resize();

    w=Math.round(w);
    h=Math.round(h);

    cgl.gl.enable(cgl.gl.SCISSOR_TEST);
    var vp=cgl.getViewPort();
    
    vp[2]=cgl.canvasWidth;
    vp[3]=cgl.canvasHeight;
    
    // console.log(posX.get(),vp,cgl.canvasWidth,cgl.canvasHeight);

    var x=0;
    if(posX.get()=='Right') x=vp[2]-w;
    if(posX.get()=='Center') x=(vp[2]-w)/2;

    x=Math.round(x);

    cgl.gl.scissor(x,vp[3]-h,w,h);
    cgl.setViewPort(x,vp[3]-h,w,h);

    mat4.perspective(cgl.pMatrix,45, ratio.get(), 0.1, 1100.0);

    trigger.trigger();
    cgl.gl.disable(cgl.gl.SCISSOR_TEST);

};
