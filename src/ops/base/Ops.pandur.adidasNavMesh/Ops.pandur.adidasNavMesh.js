Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='adidasnavmesh';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

this.x=this.addInPort(new Port(this,"x",OP_PORT_TYPE_VALUE));
this.y=this.addInPort(new Port(this,"y",OP_PORT_TYPE_VALUE));

this.part=this.addInPort(new Port(this,"part",OP_PORT_TYPE_VALUE,{display:'bool'}));

this.repeats=this.addInPort(new Port(this,"repeats",OP_PORT_TYPE_VALUE));
this.mouseOver=this.addInPort(new Port(this,"mouseOver",OP_PORT_TYPE_VALUE));

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var animEndTime=0;

this.render.onTriggered=function()
{
    if(Date.now()-animEndTime>0)rebuild();

    if(self.part.get()) 
    {
        self.mesh2.render(cgl.getShader());
    }
    else 
    {
        self.mesh.render(cgl.getShader());
    }
    self.trigger.trigger();
};

var geom=new CGL.Geometry();
this.mesh=null;

var geom2=new CGL.Geometry();
this.mesh2=null;

var yAnim=new CABLES.TL.Anim();
yAnim.defaultEasing=CABLES.TL.EASING_SIN_OUT;

var spikeh=0.9;

this.mouseOver.onValueChanged=function()
{
    if(!self.mouseOver.get())
    {
        animEndTime=Date.now()/1000+0.2;
        yAnim.clear();
        yAnim.setValue(Date.now()/1000,self.y.get());
        yAnim.setValue(animEndTime,0);
    }
    else
    {
        animEndTime=Date.now()/1000+0.1;
        yAnim.clear();
        yAnim.setValue(Date.now()/1000,0);
        yAnim.setValue(animEndTime,self.y.get());
    }
}

function rebuild()
{
    geom.clear();
    //  A BC D
    //  __  __
    //    \/
    
    var x=parseFloat(self.x.get());
    var y=parseFloat(self.y.get());
    
    if(Date.now()-animEndTime>0)
    {
        if(self.mouseOver.get())
        yAnim.setValue(animEndTime,self.y.get());

        y=yAnim.getValue(Date.now()/1000);
    }
    
    var yedge=0;//y*0.25;
    var repeats=cgl.canvas.width/cgl.canvas.height*self.repeats.get()*0.1;
    
    // var spikew=0.1-y*0.2;
    var spikew=0.1-y*0.4*cgl.canvas.width/cgl.canvas.height*0.01;
    // var spikew=0.1-y*cgl.canvas.width/cgl.canvas.height*0.01;
    
    // console.log(cgl.canvas.height/cgl.canvas.width);
    
    y+=spikeh;
    if(y>=spikeh)spikew=0;
    
    // A

    var v1=[-1.0,0,0];
    var v2=[x-spikew+yedge,0,0];
    var v3=[x-spikew,spikeh,0];
    geom.addFace(v1,v2,v3);
    geom.texCoords.push(
        0,0, 
        repeats*(v2[0]+1)/2,0, 
        repeats*(v3[0]+1)/2,1);

    v1=[-1.0,spikeh,0];
    v2=[-1.0,0,0];
    v3=[x-spikew,spikeh,0];
    geom.addFace(v1,v2,v3);
    geom.texCoords.push(
        0,1, 
        repeats*(v2[0]+1)/2,0,
        repeats*(v3[0]+1)/2,1);

    //b

    v1=[x-spikew,0,0];
    v2=[x-spikew,spikeh,0];
    v3=[x,y,0];
    geom.addFace(v1,v2,v3);
    geom.texCoords.push(
        repeats*(v1[0]+1)/2,0, 
        repeats*(v2[0]+1)/2,1, 
        repeats*(v3[0]+1)/2,1);

    v1=[x-spikew,0,0];
    v2=[x,y,0];
    v3=[x,y-spikeh,0];
    geom.addFace(v1,v2,v3);
    geom.texCoords.push(
        repeats*(v1[0]+1)/2,0, 
        repeats*(v2[0]+1)/2,1, 
        repeats*(v3[0]+1)/2,0);

    // c

    v1=[x+spikew,0,0];
    v2=[x+spikew,spikeh,0];
    v3=[x,y,0];
    geom.addFace(v1,v2,v3);
    geom.texCoords.push(
        repeats*(v1[0]+1)/2,0, 
        repeats*(v2[0]+1)/2,1, 
        repeats*(v3[0]+1)/2,1);

    v1=[x+spikew,0,0],
    v2=[x,y,0],
    v3=[x,y-spikeh,0]
    geom.addFace(v1,v2,v3);
    geom.texCoords.push(
        repeats*(v1[0]+1)/2,0, 
        repeats*(v2[0]+1)/2,1, 
        repeats*(v3[0]+1)/2,0);

    // D
    
    v1=[1.0,0,0];
    v2=[self.x.get()+spikew,0,0];
    v3=[self.x.get()+spikew,spikeh,0];
    geom.addFace(v1,v2,v3);

    geom.texCoords.push(
        repeats*1,0, 
        repeats*(v2[0]+1)/2,0, 
        repeats*(v3[0]+1)/2,1);
    
    v1=[1.0,0,0];
    v2=[1.0,spikeh,0];
    v3=[self.x.get()+spikew,spikeh,0];
    geom.addFace(v1,v2,v3);
    geom.texCoords.push(
        repeats*1,0, 
        repeats*(v2[0]+1)/2,1, 
        repeats*(v3[0]+1)/2,1);

    if(!self.mesh) self.mesh=new CGL.Mesh(cgl,geom);
    self.mesh.setGeom(geom);
    
    
    // ---------------------------------------------
    
    geom2.clear();
    
    //b

    v1=[x-spikew,1,0];
    v2=[x-spikew,1,0];
    v3=[x,y,0];
    geom2.addFace(v1,v2,v3);
    geom2.texCoords.push(
        repeats*(v1[0]+1)/2,0, 
        repeats*(v2[0]+1)/2,1, 
        repeats*(v3[0]+1)/2,1);

    v1=[x-spikew,1,0];
    v2=[x,1,0];
    v3=[x,y-spikeh/2,0];
    geom2.addFace(v1,v2,v3);
    geom2.texCoords.push(
        repeats*(v1[0]+1)/2,0, 
        repeats*(v2[0]+1)/2,1, 
        repeats*(v3[0]+1)/2,0);

    // c

    v1=[x+spikew,1,0];
    v2=[x+spikew,1,0];
    v3=[x,y,0];
    geom2.addFace(v1,v2,v3);
    geom2.texCoords.push(
        repeats*(v1[0]+1)/2,0, 
        repeats*(v2[0]+1)/2,1, 
        repeats*(v3[0]+1)/2,1);

    v1=[x+spikew,1,0],
    v2=[x,1,0],
    v3=[x,y-spikeh/2,0]
    geom2.addFace(v1,v2,v3);
    geom2.texCoords.push(
        repeats*(v1[0]+1)/2,0, 
        repeats*(v2[0]+1)/2,1, 
        repeats*(v3[0]+1)/2,0);
        
    if(!self.mesh2) self.mesh2=new CGL.Mesh(cgl,geom2);
    self.mesh2.setGeom(geom2);


}
rebuild();

this.x.onValueChanged=rebuild;
this.y.onValueChanged=rebuild;

