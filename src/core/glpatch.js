
// SHOULD BE MOVED TO UI !!
import { Shader } from "./cgl/cgl_shader";
import { Uniform } from "./cgl/cgl_shader_uniform";
import { Geometry } from "./cgl/cgl_geom";
import { Mesh } from "./cgl/cgl_mesh";

import { CONSTANTS } from "./constants";

const GLGUI = {};

GLGUI.LineDrawer=function(cgl,options)
{
    this._num=100000;
    this._counter=0;

    this._positions=new Float32Array(3*this._num);
    this._colors=new Float32Array(4*this._num);
}



// ---------------------------------------------------------------



GLGUI.RectInstancer=function(cgl,options)
{
    this._counter=0;
    this._num=100000;
    this._needsRebuild=true;

    this._positions=new Float32Array(3*this._num);
    this._colors=new Float32Array(4*this._num);
    this._sizes=new Float32Array(2*this._num);

    this._shader=new Shader(cgl,'rectinstancer');
    this._shader.setSource(''
        .endl()+'IN vec3 vPosition;'
        .endl()+'IN vec3 instPos;'
        .endl()+'IN vec4 instCol;'
        .endl()+'IN vec2 instSize;'
        .endl()+'OUT vec4 col;'
        .endl()+'UNI float zoom,resX,resY,scrollX,scrollY;'

        .endl()+'void main()'
        .endl()+'{'
        .endl()+'    vec3 pos=vPosition;'
        .endl()+'    pos.xy*=instSize;'

        .endl()+'    pos.x+=scrollX;'
        .endl()+'    pos.y+=scrollY;'

        .endl()+'    pos.x+=instPos.x;'
        .endl()+'    pos.y+=instPos.y;'

        .endl()+'    pos.y=0.0-pos.y;'

        .endl()+'    col=instCol;'

        .endl()+'    gl_Position = vec4(pos*(1.0/zoom),1.0);'
        .endl()+'}'
        , 'IN vec4 col;void main(){outColor=vec4(col.rgb,1.0);}');

    this._uniZoom=new Uniform(this._shader,'f','zoom',0),
    this._uniResX=new Uniform(this._shader,'f','resX',500),
    this._uniResY=new Uniform(this._shader,'f','resY',500),
    this._uniscrollX=new Uniform(this._shader,'f','scrollX',0),
    this._uniscrollY=new Uniform(this._shader,'f','scrollY',0);

    this._geom=new Geometry("rectinstancer");
    this._geom.vertices = new Float32Array([1,1,0, 0,1,0, 1,0,0, 0,0,0]);
    this._geom.verticesIndices = new Float32Array([ 2, 1, 0,  3, 1, 2 ]);

    this._mesh=new Mesh(cgl,this._geom);
    this._mesh.numInstances=this._num;

    var i=0;
    for(i=0;i<2*this._num;i++) this._sizes[i]=0;//Math.random()*61;
    for(i=0;i<3*this._num;i++) this._positions[i]=0;//Math.random()*60;
    for(i=0;i<4*this._num;i++) this._colors[i]=1;//Math.random();
}

GLGUI.RectInstancer.prototype.dispose=function()
{

}

GLGUI.RectInstancer.prototype.render=function(resX,resY,scrollX,scrollY,zoom)
{
    this._uniResX.set(resX);
    this._uniResY.set(resY);
    this._uniscrollX.set(scrollX);
    this._uniscrollY.set(scrollY);
    this._uniZoom.set(zoom);

    if(this._needsRebuild)this.rebuild();

    this._mesh.render(this._shader);
}

GLGUI.RectInstancer.prototype.rebuild=function()
{
    this._mesh.addAttribute('instPos',this._positions,3,{instanced:true});
    this._mesh.addAttribute('instCol',this._colors,4,{instanced:true});
    this._mesh.addAttribute('instSize',this._sizes,2,{instanced:true});
    this._needsRebuild=false;
}

GLGUI.RectInstancer.prototype.getIndex=function()
{
    this._counter++;
    // console.log("inst counter",this._counter);
    return this._counter;
}

GLGUI.RectInstancer.prototype.setPosition=function(idx,x,y)
{
    this._positions[idx*3+0]=x;
    this._positions[idx*3+1]=y;
    this._needsRebuild=true;
}

GLGUI.RectInstancer.prototype.setSize=function(idx,x,y)
{
    this._sizes[idx*2+0]=x;
    this._sizes[idx*2+1]=y;
    this._needsRebuild=true;
}

GLGUI.RectInstancer.prototype.setColor=function(idx,r,g,b)
{
    this._colors[idx*4+0]=r;
    this._colors[idx*4+1]=g;
    this._colors[idx*4+2]=b;
    this._colors[idx*4+3]=1;
    this._needsRebuild=true;
}




// ---------------------------------------

GLGUI.GlRect=function(instancer,options)
{
    options=options||{};
    this._rectInstancer=instancer;
    this._attrIndex=instancer.getIndex();
    this._parent=options.parent||null;
    this.childs=[];
}

GLGUI.GlRect.prototype.addChild=function(c)
{
    this.childs.push(c);
}

GLGUI.GlRect.prototype.setSize=function(x,y)
{
    this._rectInstancer.setSize(this._attrIndex,x,y);
}

GLGUI.GlRect.prototype.setColor=function(r,g,b)
{
    this._rectInstancer.setColor(this._attrIndex,r,g,b);
}

GLGUI.GlRect.prototype.setPosition=function(_x,_y)
{
    this.x=_x;
    this.y=_y;

    var x=this.x;
    var y=this.y;
    if(this._parent)
    {
        x+=this._parent.x;
        y+=this._parent.y;
    }

    this._rectInstancer.setPosition(this._attrIndex,x,y);

    for(var i=0;i<this.childs.length;i++)
        this.childs[i].setPosition(this.childs[i].x,this.childs[i].y);
}







// ------------------------------------

GLGUI.OP_MIN_WIDTH=100;

GLGUI.GlOp=function(instancer,op)
{
    this._op=op;
    this._instancer=instancer;
    this._glRectBg=new GLGUI.GlRect(instancer);
    // this._glRectBg.setPosition(0,0);
    this._glRectBg.setSize(100,30);
    this._glRectBg.setColor(0.1,0.1,0.1);
    this._portRects=[];

    this.updatePosition();

    for(var i=0;i<this._op.portsIn.length;i++)
        this._setupPort(i,this._op.portsIn[i]);

    for(var i=0;i<this._op.portsOut.length;i++)
        this._setupPort(i,this._op.portsOut[i]);

    const portsSize=Math.max(this._op.portsIn.length,this._op.portsOut.length)*10;

    this._glRectBg.setSize(Math.max(GLGUI.OP_MIN_WIDTH,portsSize),30);
}

GLGUI.GlOp.prototype.dispose=function()
{
    if(this._glRectBg)
    {
        this._glRectBg.setSize(0,0);
        this._glRectBg.setPosition(0,0);
    }
    for(var i=0;i<this._portRects.length;i++)
    {
        this._portRects[i].setSize(0,0);
        this._portRects[i].setPosition(0,0);
    }

    this._op=null;
    this._portRects.length=0;
    this._glRectBg=null;
    this._instancer=null;
}

GLGUI.GlOp.prototype._setupPort=function(i,p)
{
    var r=new GLGUI.GlRect(this._instancer,{"parent":this._glRectBg});
    r.setSize(7,5);

    if(p.type == CONSTANTS.OP.OP_PORT_TYPE_VALUE) r.setColor(0,1,0.7);
        else if(p.type == CONSTANTS.OP.OP_PORT_TYPE_FUNCTION) r.setColor(1,1,0);
        else if(p.type == CONSTANTS.OP.OP_PORT_TYPE_OBJECT) r.setColor(1,0,1);
        else if(p.type == CONSTANTS.OP.OP_PORT_TYPE_ARRAY) r.setColor(0,0.3,1);
        else if(p.type == CONSTANTS.OP.OP_PORT_TYPE_STRING) r.setColor(1,0.3,0);
        else if(p.type == CONSTANTS.OP.OP_PORT_TYPE_DYNAMIC) r.setColor(1,1,1);

    var y=0;
    if(p.direction==1)y=30-5;
    r.setPosition(i*10,y);
    this._glRectBg.addChild(r);
    this._portRects.push(r);
}



GLGUI.GlOp.prototype.updatePosition=function()
{
    if(!this._glRectBg)
    {
        console.log("no this._glRectBg");
        return;
    }
    this._glRectBg.setPosition(this._op.uiAttribs.translate.x,this._op.uiAttribs.translate.y);
}

GLGUI.GlOp.prototype.getOp=function()
{
    return this._op;
}

GLGUI.GlOp.prototype.update=function()
{
    this.updatePosition();
}




// ------------------------------------





GLGUI.GlPatch=function(patch)
{
    this._patch=patch;
    this._glOps=[];
    this._rectInstancer=new GLGUI.RectInstancer(this._patch.cgl);
    this._rectInstancer.rebuild();

    patch.addEventListener("onOpAdd",this.addOp.bind(this));
    patch.addEventListener("onOpDelete",this.deleteOp.bind(this));
}

GLGUI.GlPatch.prototype.getOpAt=function(x,y)
{
}

GLGUI.GlPatch.prototype.deleteOp=function(op)
{
    for(var i=0;i<this._glOps.length;i++)
    {
        if(this._glOps[i].getOp()==op)
        {
            var delOp=this._glOps[i];
            this._glOps[i].getOp().removeEventListener("onUiAttribsChange",this._glOps[i].update);
            this._glOps.slice(i,1);
            delOp.dispose();
            return;
        }
    }
}

GLGUI.GlPatch.prototype.addOp=function(op)
{
    console.log("OP ADDEDDDDDD");
    const glOp=new GLGUI.GlOp(this._rectInstancer,op);
    this._glOps.push(glOp);

    op.addEventListener("onUiAttribsChange",glOp.update.bind(glOp));
}

GLGUI.GlPatch.prototype.render=function(resX,resY,scrollX,scrollY,zoom)
{
    this._rectInstancer.render(resX,resY,scrollX,scrollY,zoom);
}

GLGUI.GlPatch.prototype.dispose=function()
{
    while(this._glOps.length>0)
    {
        this._glOps[0].dispose();
        this._glOps.splice(0,1);
    }

    if(this._rectInstancer)this._rectInstancer.dispose();
}

GLGUI.GlPatch.prototype.reset=function()
{
    this._rectInstancer=new GLGUI.RectInstancer(this._patch.cgl);
    this._rectInstancer.rebuild();

    this.dispose();

    if(this._glOps.length==0)
    {
        for(var i=0;i<this._patch.ops.length;i++)
        {
            this.addOp(this._patch.ops[i]);
        }
    }

    for(var i=0;i<this._glOps.length;i++)
    {
        this._glOps[i].updatePosition();
    }

    this._rectInstancer.rebuild();

}


export default GLGUI;
