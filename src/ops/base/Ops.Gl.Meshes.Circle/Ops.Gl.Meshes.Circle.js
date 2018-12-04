const render=op.inTrigger("render");
const radius=op.inValue('radius',0.5);
const innerRadius=op.inValueSlider('innerRadius',0);
const segments=op.inValueInt('segments',40);
const percent=op.inValueSlider('percent',1);
const steps=op.inValue('steps',0);
const invertSteps=op.inValueBool('invertSteps',false);
const mapping=op.addInPort(new CABLES.Port(op,"mapping",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:['flat','round']}));
const drawSpline=op.inValueBool("Spline",false);

const inDraw=op.inValueBool('Draw',true);
const trigger=op.outTrigger('trigger');
const geomOut=op.addOutPort(new CABLES.Port(op,"geometry",CABLES.OP_PORT_TYPE_OBJECT));


op.setPortGroup('Size',[radius,innerRadius]);
op.setPortGroup('Display',[percent,steps,invertSteps]);

mapping.set('flat');

mapping.onChange=
    segments.onChange=
    radius.onChange=
    innerRadius.onChange=
    percent.onChange=
    steps.onChange=
    invertSteps.onChange=
    drawSpline.onChange=calcLater;

geomOut.ignoreValueSerialize=true;
const cgl=op.patch.cgl;

var geom=new CGL.Geometry("circle");
var mesh=null;
var lastSegs=-1;

var oldPrim=0;
var shader=null;
var needsCalc=true;

op.preRender=
render.onTriggered=function()
{
    if(needsCalc)calc();
    shader=cgl.getShader();
    if(!shader)return;
    oldPrim=shader.glPrimitive;

    if(drawSpline.get()) shader.glPrimitive=cgl.gl.LINE_STRIP;

    if(inDraw.get())mesh.render(shader);
    trigger.trigger();

    shader.glPrimitive=oldPrim;
};

function calc()
{
    var segs=Math.max(3,Math.floor(segments.get()));

    geom.clear();

    var faces=[];
    var texCoords=[];
    var vertexNormals=[];
    var tangents=[];
    var biTangents=[];

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
        for (i=0; i <= segs*percent.get(); i++)
        {
            degInRad = (360/segs)*i*CGL.DEG2RAD;
            posx=Math.cos(degInRad)*radius.get();
            posy=Math.sin(degInRad)*radius.get();

            posyTexCoord=0.5;

            if(i>0)
            {
                verts.push(lastX);
                verts.push(lastY);
                verts.push(0);
                posxTexCoord=1.0-(i-1)/segs;

                tc.push(posxTexCoord,posyTexCoord);
            }
            verts.push(posx);
            verts.push(posy);
            verts.push(0);

            lastX=posx;
            lastY=posy;
        }
        geom.setPointVertices(verts);
    }
    else
    if(innerRadius.get()<=0)
    {

        for (i=0; i <= segs*percent.get(); i++)
        {
            degInRad = (360/segs)*i*CGL.DEG2RAD;
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
                posxTexCoord=1.0-i/segs;
                posyTexCoord=0;
                posxTexCoordIn=posxTexCoord;
                posyTexCoordIn=1;
            }

            faces.push(
                      [posx,posy,0],
                      [oldPosX,oldPosY,0],
                      [0,0,0]
                      );

            texCoords.push(posxTexCoord,posyTexCoord,oldPosXTexCoord,oldPosYTexCoord,posxTexCoordIn,posyTexCoordIn);
            vertexNormals.push(0,0,1,0,0,1,0,0,1);
            tangents.push(1,0,0,1,0,0,1,0,0);
            biTangents.push(0,1,0,0,1,0,0,1,0);

            oldPosXTexCoord=posxTexCoord;
            oldPosYTexCoord=posyTexCoord;

            oldPosX=posx;
            oldPosY=posy;
        }

        geom=CGL.Geometry.buildFromFaces(faces);
        geom.vertexNormals=vertexNormals;
        geom.tangents=tangents;
        geom.biTangents=biTangents;
        geom.texCoords=texCoords;
    }
    else
    {
        var count=0;
        var numSteps=segs*percent.get();
        var pos=0;

        for (i=0; i <= numSteps; i++)
        {
            count++;

            degInRad = (360/segs)*i*CGL.DEG2RAD;
            posx=Math.cos(degInRad)*radius.get();
            posy=Math.sin(degInRad)*radius.get();

            var posxIn=Math.cos(degInRad)*innerRadius.get()*radius.get();
            var posyIn=Math.sin(degInRad)*innerRadius.get()*radius.get();

            if(mapping.get()=='round')
            {
                posxTexCoord=1.0-i/segs;
                posyTexCoord=0;
                posxTexCoordIn=posxTexCoord;
                posyTexCoordIn=1;
            }

            if(steps.get()===0.0 ||
                (count%parseInt(steps.get(),10)===0 && !invertSteps.get()) ||
                (count%parseInt(steps.get(),10)!==0 && invertSteps.get()) )
            {
                faces.push(
                        [posx,posy,0],
                        [oldPosX,oldPosY,0],
                        [posxIn,posyIn,0]
                        );

                faces.push(
                        [posxIn,posyIn,0],
                        [oldPosX,oldPosY,0],
                        [oldPosXIn,oldPosYIn,0]
                        );

                texCoords.push(
                    posxTexCoord,0,
                    oldPosXTexCoord,0,
                    posxTexCoordIn,1,

                    posxTexCoord,1,
                    oldPosXTexCoord,0,
                    oldPosXTexCoordIn,1);

                vertexNormals.push(
                    0,0,1,0,0,1,0,0,1,
                    0,0,1,0,0,1,0,0,1
                );
                tangents.push(
                    1,0,0,1,0,0,1,0,0,
                    1,0,0,1,0,0,1,0,0
                );
                biTangents.push(
                    0,1,0,0,1,0,0,1,0,
                    0,1,0,0,1,0,0,1,0
                );
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

        geom=CGL.Geometry.buildFromFaces(faces);
        geom.vertexNormals=vertexNormals;
        geom.tangents=tangents;
        geom.biTangents=biTangents;

        if(mapping.get()=='flat') geom.mapTexCoords2d();
            else geom.texCoords=texCoords;
    }

    geomOut.set(null);
    geomOut.set(geom);

    if(geom.vertices.length==0)return;
    if(mesh) mesh.dispose();
    mesh=null;
    mesh=new CGL.Mesh(cgl,geom);
    needsCalc=false;
}

function calcLater()
{
    needsCalc=true;
}

op.onDelete=function()
{
    if(mesh)mesh.dispose();
}