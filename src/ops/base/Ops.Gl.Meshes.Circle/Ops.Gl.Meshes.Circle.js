var self=this;
var cgl=this.patch.cgl;

this.name='Circle';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

this.segments=this.addInPort(new Port(this,"segments"));
this.radius=this.addInPort(new Port(this,"radius"));
this.innerRadius=this.addInPort(new Port(this,"innerRadius",OP_PORT_TYPE_VALUE,{display:"range"}));
this.percent=this.addInPort(new Port(this,"percent",OP_PORT_TYPE_VALUE,{display:'range'}));

this.steps=this.addInPort(new Port(this,"steps",OP_PORT_TYPE_VALUE,{type:"int"}));
this.steps.val=0.0;
this.invertSteps=this.addInPort(new Port(this,"invertSteps",OP_PORT_TYPE_VALUE,{ display:'bool' }));
this.invertSteps.val=false;


this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.render.onTriggered=function()
{
    mesh.render(cgl.getShader());
    self.trigger.trigger();
};

this.segments.val=40;
this.radius.val=1;
this.innerRadius.val=0;
this.percent.val=1;


var geom=new CGL.Geometry();
var mesh=new CGL.Mesh(cgl,geom);

function calc()
{
    geom.clear();
    var i=0,degInRad=0;
    var oldPosX=0,oldPosY=0;
    var oldPosXTexCoord=0,oldPosYTexCoord=0;

    var oldPosXIn=0,oldPosYIn=0;
    var oldPosXTexCoordIn=0,oldPosYTexCoordIn=0;

    var posxTexCoord=0,posyTexCoord=0;
    var posx=0,posy=0;

    if(self.innerRadius.get()<=0)
    {
      for (i=0; i <= Math.round(self.segments.get())*self.percent.get(); i++)
      {
          degInRad = (360/Math.round(self.segments.get()))*i*CGL.DEG2RAD;
          posx=Math.cos(degInRad)*self.radius.get();
          posy=Math.sin(degInRad)*self.radius.get();

          posxTexCoord=(Math.cos(degInRad)+1.0)/2;
          posyTexCoord=(Math.sin(degInRad)+1.0)/2;

          geom.addFace(
                      [posx,posy,0],
                      [oldPosX,oldPosY,0],
                      [0,0,0]
                      );

          geom.texCoords.push(posxTexCoord,posyTexCoord,oldPosXTexCoord,oldPosYTexCoord,0.5,0.5);

          oldPosXTexCoord=posxTexCoord;
          oldPosYTexCoord=posyTexCoord;

          oldPosX=posx;
          oldPosY=posy;
      }
    }
    else
    {
      var count=0;
      for (i=0; i <= Math.round(self.segments.get())*self.percent.get(); i++)
      {
          count++;

          degInRad = (360/Math.round(self.segments.get()))*i*CGL.DEG2RAD;
          posx=Math.cos(degInRad)*self.radius.get();
          posy=Math.sin(degInRad)*self.radius.get();

          var posxIn=Math.cos(degInRad)*self.innerRadius.get()*self.radius.get();
          var posyIn=Math.sin(degInRad)*self.innerRadius.get()*self.radius.get();

          posxTexCoord=(Math.cos(degInRad)+1.0)/2;
          posyTexCoord=(Math.sin(degInRad)+1.0)/2;

          var posxTexCoordIn=(Math.cos(degInRad)+1.0)/2*self.innerRadius.get();
          var posyTexCoordIn=(Math.sin(degInRad)+1.0)/2*self.innerRadius.get();

          if(self.steps.get()===0.0 ||
            (count%parseInt(self.steps.get(),10)===0 && !self.invertSteps.get()) ||
            (count%parseInt(self.steps.get(),10)!==0 && self.invertSteps.get())
            )
          {
              geom.addFace(
                          [posx,posy,0],
                          [oldPosX,oldPosY,0],
                          [posxIn,posyIn,0]
                          );

              geom.addFace(
                          [posxIn,posyIn,0],
                          [oldPosX,oldPosY,0],
                          [oldPosXIn,oldPosYIn,0]
                          );

              geom.texCoords.push(posxTexCoord,posyTexCoord,oldPosXTexCoord,oldPosYTexCoord,posxTexCoordIn,posyTexCoordIn);
              geom.texCoords.push(posxTexCoordIn,posyTexCoordIn,oldPosXTexCoord,oldPosYTexCoord,oldPosXTexCoordIn,oldPosYTexCoordIn);
          }

          oldPosXTexCoordIn=posxTexCoordIn;
          oldPosYTexCoordIn=posyTexCoordIn;

          oldPosXTexCoord=posxTexCoord;
          oldPosYTexCoord=posyTexCoord;

          oldPosX=posx;
          oldPosY=posy;

          oldPosXIn=posxIn;
          oldPosYIn=posyIn;
        }
    }

    mesh.setGeom(geom);
}

this.segments.onValueChanged=calc;
this.radius.onValueChanged=calc;
this.innerRadius.onValueChanged=calc;
this.percent.onValueChanged=calc;
this.steps.onValueChanged=calc;
this.invertSteps.onValueChanged=calc;
calc();
