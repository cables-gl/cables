

var CABLES=CABLES||{};
CABLES.GLGUI=CABLES.GLGUI||{};

CABLES.GLGUI.RectInstancer=function(cgl,options)
{
    this._counter=0;
    this._num=100000;
    this._needsRebuild=true;

    this._positions=new Float32Array(3*this._num);
    this._colors=new Float32Array(4*this._num);
    this._sizes=new Float32Array(2*this._num);

    this._shader=new CGL.Shader(cgl,'rectinstancer');
    this._shader.setSource(''
    .endl()+'IN vec3 vPosition;'
    .endl()+'IN vec3 instPos;'
    .endl()+'IN vec4 instCol;'
    .endl()+'IN vec2 instSize;'
    .endl()+'OUT vec4 col;'
    .endl()+'UNI float zoom, resX,resY,scrollX,scrollY;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'    vec3 pos=vPosition;'
    .endl()+'    pos.xy*=instSize;'

    .endl()+'    pos.x/=resX;'
    .endl()+'    pos.y/=resY;'
    .endl()+'    pos.x+=scrollX;'
    .endl()+'    pos.y+=scrollY;'

    .endl()+'    pos.x+=instPos.x;'
    .endl()+'    pos.y+=instPos.y;'

    .endl()+'    pos.xy/=zoom;'


    .endl()+'    pos.y=0.0-pos.y;'

    .endl()+'    col=instCol;'

    .endl()+'    gl_Position = vec4(pos,1.0);'
    .endl()+'}'
        ,

        'IN vec4 col;void main(){outColor=vec4(col.rgb,1.0);}');

    this._uniZoom=new CGL.Uniform(this._shader,'f','zoom',0),
    this._uniResX=new CGL.Uniform(this._shader,'f','resX',500),
    this._uniResY=new CGL.Uniform(this._shader,'f','resY',500),
    this._uniscrollX=new CGL.Uniform(this._shader,'f','scrollX',0),
    this._uniscrollY=new CGL.Uniform(this._shader,'f','scrollY',0);

    
    this._geom=new CGL.Geometry("rectinstancer");
    this._geom.vertices = new Float32Array([1,1,0, 0,1,0, 1,0,0, 0,0,0]);
    this._geom.verticesIndices = new Float32Array([ 2, 1, 0,  3, 1, 2 ]);

    this._mesh=new CGL.Mesh(cgl,this._geom);
    this._mesh.numInstances=this._num;

    var i=0;

    for(i=0;i<2*this._num;i++) this._sizes[i]=0;//Math.random()*61;
    for(i=0;i<3*this._num;i++) this._positions[i]=0;//Math.random()*60;
    for(i=0;i<4*this._num;i++) this._colors[i]=1;//Math.random();

}

CABLES.GLGUI.RectInstancer.prototype.render=function(resX,resY,scrollX,scrollY,zoom)
{
    this._uniResX.set(resX);
    this._uniResY.set(resY);
    this._uniscrollX.set(scrollX);
    this._uniscrollY.set(scrollY);
    this._uniZoom.set(zoom);

    if(this._needsRebuild)this.rebuild();
    
    this._mesh.render(this._shader);
}

CABLES.GLGUI.RectInstancer.prototype.rebuild=function()
{
    this._mesh.addAttribute('instPos',this._positions,3,{instanced:true});
    this._mesh.addAttribute('instCol',this._colors,4,{instanced:true});
    this._mesh.addAttribute('instSize',this._sizes,2,{instanced:true});
    this._needsRebuild=false;
}

CABLES.GLGUI.RectInstancer.prototype.getIndex=function()
{
    this._counter++
    return this._counter;
}

CABLES.GLGUI.RectInstancer.prototype.setPosition=function(idx,x,y)
{
    this._positions[idx*3+0]=x;
    this._positions[idx*3+1]=y;
    this._needsRebuild=true;
}

CABLES.GLGUI.RectInstancer.prototype.setSize=function(idx,x,y)
{
    this._sizes[idx*2+0]=x;
    this._sizes[idx*2+1]=y;
    this._needsRebuild=true;
}

CABLES.GLGUI.RectInstancer.prototype.setColor=function(idx,r,g,b)
{
    this._colors[idx*4+0]=r;
    this._colors[idx*4+1]=g;
    this._colors[idx*4+2]=b;
    this._colors[idx*4+3]=1;
    this._needsRebuild=true;
}






// ---------------------------------------

CABLES.GLGUI.GlRect=function(instancer,options)
{
    options=options||{};
    this._rectInstancer=instancer;
    this._attrIndex=instancer.getIndex();
    this._parent=options.parent||null;
    this.childs=[];
}

CABLES.GLGUI.GlRect.prototype.addChild=function(c)
{
    this.childs.push(c);
}

CABLES.GLGUI.GlRect.prototype.setSize=function(x,y)
{
    this._rectInstancer.setSize(this._attrIndex,x,y);
}

CABLES.GLGUI.GlRect.prototype.setColor=function(r,g,b)
{
    this._rectInstancer.setColor(this._attrIndex,r,g,b);
}

CABLES.GLGUI.GlRect.prototype.setPosition=function(_x,_y)
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

    // console.log(x,y);

    this._rectInstancer.setPosition(this._attrIndex,x*0.01,y*0.01);

    for(var i=0;i<this.childs.length;i++)
        this.childs[i].setPosition(this.childs[i].x,this.childs[i].y);
}







// ------------------------------------


CABLES.GLGUI.GlOp=function(instancer,op)
{
    this._op=op;
    this._instancer=instancer;
    this._glRectBg=new CABLES.GLGUI.GlRect(instancer);
    // this._glRectBg.setPosition(0,0);
    this._glRectBg.setSize(1000,200);
    this._glRectBg.setColor(0.1,0.1,0.1);

    
    this.updatePosition();

    for(var i=0;i<this._op.portsIn.length;i++)
    {
        var r=new CABLES.GLGUI.GlRect(this._instancer,{"parent":this._glRectBg});
        r.setSize(40,40);
        r.setColor(1,1,1);
        r.setPosition(i*10,0);
        this._glRectBg.addChild(r);
    }

    
}

CABLES.GLGUI.GlOp.prototype.updatePosition=function()
{
    this._glRectBg.setPosition(this._op.uiAttribs.translate.x,this._op.uiAttribs.translate.y);
}

CABLES.GLGUI.GlOp.prototype.update=function()
{



    this.updatePosition();
}


// ------------------------------------








CABLES.GLGUI.GlPatch=function(patch)
{
    this._patch=patch;
    this._glOps=[];
    this._rectInstancer=new CABLES.GLGUI.RectInstancer(patch.cgl);
    this._rectInstancer.rebuild();
}

CABLES.GLGUI.GlPatch.prototype.getOpAt=function(x,y)
{
}

CABLES.GLGUI.GlPatch.prototype.render=function(resX,resY,scrollX,scrollY,zoom)
{
    
    this._rectInstancer.render(resX,resY,scrollX,scrollY,zoom);
}

CABLES.GLGUI.GlPatch.prototype.reset=function()
{
    if(this._glOps.length==0)
    {
        for(var i=0;i<this._patch.ops.length;i++)
        {
            const glOp=new CABLES.GLGUI.GlOp(this._rectInstancer,this._patch.ops[i]);
            this._glOps.push(glOp);

            
            this._patch.ops[i].addEventListener("onUiAttribsChange",glOp.update.bind(glOp));
        }
    }

    for(var i=0;i<this._glOps.length;i++)
    {
        this._glOps[i].updatePosition();
    }

    this._rectInstancer.rebuild();
   
}

