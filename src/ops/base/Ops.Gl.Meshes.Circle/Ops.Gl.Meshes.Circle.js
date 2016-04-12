op.name='Circle';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var segments=op.addInPort(new Port(op,"segments"));
var radius=op.addInPort(new Port(op,"radius"));
var innerRadius=op.addInPort(new Port(op,"innerRadius",OP_PORT_TYPE_VALUE,{display:"range"}));
var percent=op.addInPort(new Port(op,"percent",OP_PORT_TYPE_VALUE,{display:'range'}));

var steps=op.addInPort(new Port(op,"steps",OP_PORT_TYPE_VALUE,{type:"int"}));
steps.set(0.0);
var invertSteps=op.addInPort(new Port(op,"invertSteps",OP_PORT_TYPE_VALUE,{ display:'bool' }));
invertSteps.set(false);

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));
geomOut.ignoreValueSerialize=true;
var cgl=op.patch.cgl;


render.onTriggered=function()
{
    mesh.render(cgl.getShader());
    trigger.trigger();
};

segments.set(40);
radius.set(1);
innerRadius.set(0);
percent.set(1);

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

    var posxTexCoordIn=0,posyTexCoordIn=0;
    var posxTexCoord=0,posyTexCoord=0;
    var posx=0,posy=0;

    if(innerRadius.get()<=0)
    {
      for (i=0; i <= Math.round(segments.get())*percent.get(); i++)
      {
          degInRad = (360/Math.round(segments.get()))*i*CGL.DEG2RAD;
          posx=Math.cos(degInRad)*radius.get();
          posy=Math.sin(degInRad)*radius.get();


            if(mapping.get()=='flat')
            {
                posxTexCoord=(Math.cos(degInRad)+1.0)/2;
                posyTexCoord=1.0-(Math.sin(degInRad)+1.0)/2;
                posxTexCoordIn=0.5;
                posyTexCoordIn=0.5;
            }
            else if(mapping.get()=='round')
            {
                posxTexCoord=1.0-i/segments.get();
                posyTexCoord=0;
                posxTexCoordIn=posxTexCoord;
                posyTexCoordIn=1;
            }

        //   posxTexCoord=(Math.cos(degInRad)+1.0)/2;
        //   posyTexCoord=(Math.sin(degInRad)+1.0)/2;

          geom.addFace(
                      [posx,posy,0],
                      [oldPosX,oldPosY,0],
                      [0,0,0]
                      );

          geom.texCoords.push(posxTexCoord,posyTexCoord,oldPosXTexCoord,oldPosYTexCoord,posxTexCoordIn,posyTexCoordIn);

          oldPosXTexCoord=posxTexCoord;
          oldPosYTexCoord=posyTexCoord;

          oldPosX=posx;
          oldPosY=posy;
      }
    }
    else
    {
      var count=0;
      for (i=0; i <= Math.round(segments.get())*percent.get(); i++)
      {
          count++;

          degInRad = (360/Math.round(segments.get()))*i*CGL.DEG2RAD;
          posx=Math.cos(degInRad)*radius.get();
          posy=Math.sin(degInRad)*radius.get();

          var posxIn=Math.cos(degInRad)*innerRadius.get()*radius.get();
          var posyIn=Math.sin(degInRad)*innerRadius.get()*radius.get();

        
        if(mapping.get()=='flat')
        {
            posxTexCoord=(Math.cos(degInRad)+1.0)/2;
            posyTexCoord=1.0-(Math.sin(degInRad)+1.0)/2;
            posxTexCoordIn=((posxTexCoord-0.5)*innerRadius.get())+0.5;
            posyTexCoordIn=((posyTexCoord-0.5)*innerRadius.get())+0.5;
        }
        else if(mapping.get()=='round')
        {
            posxTexCoord=1.0-i/segments.get();
            posyTexCoord=0;
            posxTexCoordIn=posxTexCoord;
            posyTexCoordIn=1;
        }

          if(steps.get()===0.0 ||
            (count%parseInt(steps.get(),10)===0 && !invertSteps.get()) ||
            (count%parseInt(steps.get(),10)!==0 && invertSteps.get())
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
    geomOut.set(null);
    geomOut.set(geom);
    mesh.setGeom(geom);
}

var mapping=op.addInPort(new Port(op,"mapping",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['flat','round']}));
mapping.val='flat';
mapping.onValueChange(calc);

segments.onValueChanged=calc;
radius.onValueChanged=calc;
innerRadius.onValueChanged=calc;
percent.onValueChanged=calc;
steps.onValueChanged=calc;
invertSteps.onValueChanged=calc;
calc();
