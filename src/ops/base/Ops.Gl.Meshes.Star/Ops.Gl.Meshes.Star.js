var render=op.inTrigger("render");
var segments=op.inValue('segments',40);
var radius=op.inValue('radius',1);
var shape=op.inValueSelect('Shape',['Star','Saw','Gear'],'Star');
var outerRadius=op.inValue('Length',1.5);
var percent=op.inValueSlider('percent');

var fill=op.inValueBool("Fill");

var trigger=op.outTrigger('trigger');
var geomOut=op.addOutPort(new CABLES.Port(op,"geometry",CABLES.OP_PORT_TYPE_OBJECT));

geomOut.ignoreValueSerialize=true;
var cgl=op.patch.cgl;


var oldPrim=0;
var shader=null;
render.onTriggered=function()
{
    if(op.instanced(render))return;
    
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;
    

    mesh.render(shader);
    trigger.trigger();

    shader.glPrimitive=oldPrim;
};

percent.set(1);

var geom=new CGL.Geometry("circle");
var mesh=null;
var lastSegs=-1;
function calc()
{
    var segs=Math.max(3,Math.floor(segments.get()));
    
    geom.clear();

    var faces=[];
    // var texCoords=[];
    var vertexNormals=[];

    var i=0,degInRad=0;
    var oldPosX=0,oldPosY=0;
    var oldPosXTexCoord=0,oldPosYTexCoord=0;

    var oldPosXIn=0,oldPosYIn=0;
    var oldPosXTexCoordIn=0,oldPosYTexCoordIn=0;

    var posxTexCoordIn=0,posyTexCoordIn=0;
    var posxTexCoord=0,posyTexCoord=0;
    var posx=0,posy=0;

    var verts=[];
    var outX=0,outY=0;

    var imode=0;
    if(shape.get()=="Saw")imode=1;
    if(shape.get()=="Gear")imode=2;

    var cycleGear=true;    

    for (i=0; i <= segs*percent.get(); i++)
    {
        degInRad = (360/segs)*i*CGL.DEG2RAD;
        posx=Math.cos(degInRad)*radius.get();
        posy=Math.sin(degInRad)*radius.get();

        // saw mode
        cycleGear=!cycleGear;

        switch(imode)
        {
            case 0:
                outX=((posx+oldPosX)*0.5)*outerRadius.get();
                outY=((posy+oldPosY)*0.5)*outerRadius.get();
            break;

            case 1:
                outX=(posx)*outerRadius.get();
                outY=(posy)*outerRadius.get();
            break;

            case 2:
                if(cycleGear)
                {
                    outX=(posx)*outerRadius.get();
                    outY=(posy)*outerRadius.get();
    
                    degInRad = (360/segs)*(i-1)*CGL.DEG2RAD;
                    var ooutX=Math.cos(degInRad)*radius.get();
                    var ooutY=Math.sin(degInRad)*radius.get();
    
                    ooutX*=outerRadius.get();
                    ooutY*=outerRadius.get();
                    
                    faces.push(
                            [ooutX,ooutY,0],
                            [outX,outY,0],
                            [oldPosX,oldPosY,0]
                            );
                    
                }

            break;
        }


        // if(mapping.get()=='flat')
        // {
        //     posxTexCoord=(Math.cos(degInRad)+1.0)/2;
        //     posyTexCoord=1.0-(Math.sin(degInRad)+1.0)/2;
        //     posxTexCoordIn=0.5;
        //     posyTexCoordIn=0.5;
        // }
        // else if(mapping.get()=='round')
        // {
        //     posxTexCoord=1.0-i/segs;
        //     posyTexCoord=0;
        //     posxTexCoordIn=posxTexCoord;
        //     posyTexCoordIn=1;
        // }

        if(fill.get())
            faces.push(
                  [posx,posy,0],
                  [oldPosX,oldPosY,0],
                  [0,0,0]
                  );


        if(imode!=2 || cycleGear)
        {
            faces.push(
                    [posx,posy,0],
                    [oldPosX,oldPosY,0],
                    [outX,outY,0]
                    );
        }

        // oldPosXTexCoord=posxTexCoord;
        // oldPosYTexCoord=posyTexCoord;
        
        oldPosX=posx;
        oldPosY=posy;
    }
  
    geom=CGL.Geometry.buildFromFaces(faces);
    geom.vertexNormals=vertexNormals;
    // geom.texCoords=texCoords;
    geom.mapTexCoords2d();

    geomOut.set(null);
    geomOut.set(geom);
    
    if(geom.vertices.length==0)return;
    if(!mesh)mesh=new CGL.Mesh(cgl,geom);
    mesh.setGeom(geom);
}

// var mapping=op.addInPort(new CABLES.Port(op,"mapping",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['flat','round']}));
// mapping.set('flat');
// mapping.onValueChange(calc);

segments.onChange=calc;
radius.onChange=calc;
percent.onChange=calc;
shape.onChange=calc;
fill.onChange=calc;
outerRadius.onChange=calc;
calc();

