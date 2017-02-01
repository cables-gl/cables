op.name='Circle';
var render=op.inFunction("render");
var segments=op.inValue('segments',40);
var radius=op.inValue('radius',1);
var innerRadius=op.inValueSlider('innerRadius',0);
var percent=op.inValueSlider('percent');
var steps=op.inValue('steps',0);
var invertSteps=op.inValueBool('invertSteps',false);

var trigger=op.outFunction('trigger');
var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));

geomOut.ignoreValueSerialize=true;
var cgl=op.patch.cgl;

var drawSpline=op.addInPort(new Port(op,"Spline",OP_PORT_TYPE_VALUE,{ display:'bool' }));
drawSpline.set(false);



var oldPrim=0;
var shader=null;
render.onTriggered=function()
{
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;
    
    if(drawSpline.get()) shader.glPrimitive=cgl.gl.LINE_STRIP;

    mesh.render(shader);
    trigger.trigger();

    shader.glPrimitive=oldPrim;
};

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

    var verts=[];

    if(drawSpline.get())
    {
        var lastX=0;
        var lastY=0;
        var tc=[];
        for (i=0; i <= Math.round(segments.get())*percent.get(); i++)
        {
            degInRad = (360/Math.round(segments.get()))*i*CGL.DEG2RAD;
            posx=Math.cos(degInRad)*radius.get();
            posy=Math.sin(degInRad)*radius.get();
            
            posyTexCoord=0.5;


            if(i>0)
            {
                verts.push(lastX);
                verts.push(lastY);
                verts.push(0);
                posxTexCoord=1.0-(i-1)/segments.get();
                
                tc.push(posxTexCoord,posyTexCoord);

            }
            verts.push(posx);
            verts.push(posy);
            verts.push(0);
            
            posxTexCoord=1.0-i/segments.get();
            tc.push(posxTexCoord,posyTexCoord);



            lastX=posx;
            lastY=posy;
        }
        geom.setPointVertices(verts);
        geom.texCoords=tc;
    }
    else
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
            geom.vertexNormals.push(0,0,1,0,0,1,0,0,1);
            
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
                (count%parseInt(steps.get(),10)!==0 && invertSteps.get()) )
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
                geom.texCoords.push(posxTexCoord,posyTexCoord,oldPosXTexCoord,oldPosYTexCoord,posxTexCoordIn,posyTexCoordIn);

                geom.vertexNormals.push(0,0,1,0,0,1,0,0,1);
                geom.vertexNormals.push(0,0,1,0,0,1,0,0,1);
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
mapping.set('flat');
mapping.onValueChange(calc);

segments.onChange=calc;
radius.onChange=calc;
innerRadius.onChange=calc;
percent.onChange=calc;
steps.onChange=calc;
invertSteps.onChange=calc;
drawSpline.onChange=calc;
calc();
