const
    render=op.inTrigger("Render"),
    inDraw=op.inValueBool("draw",true),
    inNum=op.inValueInt("Num",100),
    inGeomSurface=op.inObject("Geom Surface"),
    inGeom=op.inObject("Geometry"),
    inDistribution=op.inValueSelect("Distribution",['Vertex','Triangle Center','Triangle Side','Random Triangle Point'],'Vertex'),
    inVariety=op.inValueSelect("Selection",["Random","Sequential"],"Random"),
    seed=op.inValueFloat("Random Seed"),
    inSizeMin=op.inValueSlider("Size min",1.0),
    inSizeMax=op.inValueSlider("Size max",1.0),
    inDoLimit=op.inValueBool("Limit",false),
    inLimit=op.inValueInt("Limit Num",0),
    inRotateRandom=op.inValueBool("Random Rotate",true),
    outArrPositions=op.outArray("Positions")
    // outArrRotations=op.outArray("Rotation")
    ;

const cgl=op.patch.cgl;
var mod=null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;
var recalc=true;

var matrixArray=new Float32Array(1);
const m=mat4.create();
var qAxis=vec3.create();

op.setPortGroup("Size",[inSizeMin,inSizeMax]);
op.setPortGroup("Distribution",[inDistribution,inVariety,seed]);

inDistribution.onChange=
    seed.onChange=
    inNum.onChange=
    inRotateRandom.onChange=
    inSizeMin.onChange=
    inSizeMax.onChange=
    inVariety.onChange=
    inGeomSurface.onChange=reset;
render.onTriggered=doRender;
render.onLinkChanged=removeModule;

var arrPositions=[];
var arrRotations=[];




function uniqueIndices(oldCount,newCount,randomize)
{
    function fisherYatesShuffle(array)
    {
        Math.randomSeed=seed.get();
        var i = 0;
        var j = 0;
        var temp = null;

        for (i = array.length - 1; i > 0; i -= 1)
        {
            j = Math.floor(Math.seededRandom()* (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    var arr=[];
    arr.length=newCount;

    if(newCount>oldCount)
    {
        arr.length=newCount;
        for(var i=0;i<newCount;i++) arr[i]=i%(oldCount);
    }
    else
    {
        arr.length=oldCount;
        for(var i=0;i<oldCount;i++) arr[i]=i;
    }

    if(randomize)fisherYatesShuffle(arr);
    return arr;
}


function setup()
{
    // if(!mesh)return;
    op.toWorkPortsNeedToBeLinkedReset();

    if(inDraw.get())
    {
        op.toWorkPortsNeedToBeLinked(inGeom);
    }
    var geom=inGeomSurface.get();
    var num=Math.abs(Math.floor(inNum.get()));
    var m=mat4.create();
    var q=quat.create();
    var vm2=vec3.create();
    var qMat=mat4.create();
    var norm=vec3.create();

    if(!geom) return;

    Math.randomSeed=seed.get();

    const DISTMODE_VERTEX=0;
    const DISTMODE_TRIANGLE_CENTER=1;
    const DISTMODE_TRIANGLE_SIDE=2;
    const DISTMODE_TRIANGLE_RANDOM=3;

    var distMode=0;
    if(inDistribution.get()=='Triangle Center')distMode=DISTMODE_TRIANGLE_CENTER;
    else if(inDistribution.get()=='Triangle Side')distMode=DISTMODE_TRIANGLE_SIDE;
    else if(inDistribution.get()=='Random Triangle Point')distMode=DISTMODE_TRIANGLE_RANDOM;

    if(matrixArray.length!=num*16) matrixArray=new Float32Array(num*16);

    if(geom.isIndexed())
    {
        var faces=geom.verticesIndices;
        var indices=uniqueIndices(faces.length/3,num,inVariety.get()=="Random");

        arrRotations.length=arrPositions.length=num*3;


        for(var i=0;i<num;i++)
        {
            var index=indices[i];
            var index3=index*3;

            var px=0;
            var py=0;
            var pz=0;

            mat4.identity(m);

            var nx=geom.vertexNormals[faces[index3]*3+0];
            var ny=geom.vertexNormals[faces[index3]*3+1];
            var nz=geom.vertexNormals[faces[index3]*3+2];

            if(distMode==DISTMODE_VERTEX)
            {
                px=geom.vertices[faces[index3]*3+0];
                py=geom.vertices[faces[index3]*3+1];
                pz=geom.vertices[faces[index3]*3+2];
            }
            else if(distMode==DISTMODE_TRIANGLE_CENTER)
            {
                px=(geom.vertices[faces[index3]*3+0]+geom.vertices[faces[index3+1]*3+0]+geom.vertices[faces[index3+2]*3+0])/3;
                py=(geom.vertices[faces[index3]*3+1]+geom.vertices[faces[index3+1]*3+1]+geom.vertices[faces[index3+2]*3+1])/3;
                pz=(geom.vertices[faces[index3]*3+2]+geom.vertices[faces[index3+1]*3+2]+geom.vertices[faces[index3+2]*3+2])/3;

                nx=(geom.vertexNormals[faces[index3]*3+0]+geom.vertexNormals[faces[index3+1]*3+0]+geom.vertexNormals[faces[index3+2]*3+0])/3;
                ny=(geom.vertexNormals[faces[index3]*3+1]+geom.vertexNormals[faces[index3+1]*3+1]+geom.vertexNormals[faces[index3+2]*3+1])/3;
                nz=(geom.vertexNormals[faces[index3]*3+2]+geom.vertexNormals[faces[index3+1]*3+2]+geom.vertexNormals[faces[index3+2]*3+2])/3;

            }
            else if(distMode==DISTMODE_TRIANGLE_SIDE)
            {
                var which=Math.round(Math.seededRandom()*3.0);
                var whichA=which;
                var whichB=which+1;
                if(whichB>2)whichB=0;

                px=( geom.vertices[faces[index3+whichA]*3+0]+geom.vertices[faces[index3+whichB]*3+0] )/2;
                py=( geom.vertices[faces[index3+whichA]*3+1]+geom.vertices[faces[index3+whichB]*3+1] )/2;
                pz=( geom.vertices[faces[index3+whichA]*3+2]+geom.vertices[faces[index3+whichB]*3+2] )/2;

            }
            else if(distMode==DISTMODE_TRIANGLE_RANDOM)
            {
                var r=Math.seededRandom();
                var p1x=CABLES.map(r,0,1,geom.vertices[(faces[index3+0])*3+0],geom.vertices[(faces[index3+1])*3+0]);
                var p1y=CABLES.map(r,0,1,geom.vertices[(faces[index3+0])*3+1],geom.vertices[(faces[index3+1])*3+1]);
                var p1z=CABLES.map(r,0,1,geom.vertices[(faces[index3+0])*3+2],geom.vertices[(faces[index3+1])*3+2]);

                var n1x=CABLES.map(r,0,1,geom.vertexNormals[(faces[index3+0])*3+0],geom.vertexNormals[(faces[index3+1])*3+0]);
                var n1y=CABLES.map(r,0,1,geom.vertexNormals[(faces[index3+0])*3+1],geom.vertexNormals[(faces[index3+1])*3+1]);
                var n1z=CABLES.map(r,0,1,geom.vertexNormals[(faces[index3+0])*3+2],geom.vertexNormals[(faces[index3+1])*3+2]);

                r=Math.seededRandom();
                var p2x=CABLES.map(r,0,1,geom.vertices[(faces[index3+1])*3+0],geom.vertices[(faces[index3+2])*3+0]);
                var p2y=CABLES.map(r,0,1,geom.vertices[(faces[index3+1])*3+1],geom.vertices[(faces[index3+2])*3+1]);
                var p2z=CABLES.map(r,0,1,geom.vertices[(faces[index3+1])*3+2],geom.vertices[(faces[index3+2])*3+2]);

                var n2x=CABLES.map(r,0,1,geom.vertexNormals[(faces[index3+1])*3+0],geom.vertexNormals[(faces[index3+2])*3+0]);
                var n2y=CABLES.map(r,0,1,geom.vertexNormals[(faces[index3+1])*3+1],geom.vertexNormals[(faces[index3+2])*3+1]);
                var n2z=CABLES.map(r,0,1,geom.vertexNormals[(faces[index3+1])*3+2],geom.vertexNormals[(faces[index3+2])*3+2]);

                r=Math.seededRandom();
                var p3x=CABLES.map(r,0,1,geom.vertices[(faces[index3+2])*3+0],geom.vertices[(faces[index3+0])*3+0]);
                var p3y=CABLES.map(r,0,1,geom.vertices[(faces[index3+2])*3+1],geom.vertices[(faces[index3+0])*3+1]);
                var p3z=CABLES.map(r,0,1,geom.vertices[(faces[index3+2])*3+2],geom.vertices[(faces[index3+0])*3+2]);

                var n3x=CABLES.map(r,0,1,geom.vertexNormals[(faces[index3+2])*3+0],geom.vertexNormals[(faces[index3+0])*3+0]);
                var n3y=CABLES.map(r,0,1,geom.vertexNormals[(faces[index3+2])*3+1],geom.vertexNormals[(faces[index3+0])*3+1]);
                var n3z=CABLES.map(r,0,1,geom.vertexNormals[(faces[index3+2])*3+2],geom.vertexNormals[(faces[index3+0])*3+2]);

                px=(p1x+p2x+p3x)/3;
                py=(p1y+p2y+p3y)/3;
                pz=(p1z+p2z+p3z)/3;

                nx=(n1x+n2x+n3x)/3;
                ny=(n1y+n2y+n3y)/3;
                nz=(n1z+n2z+n3z)/3;
            }

            arrPositions[i*3+0]=px;
            arrPositions[i*3+1]=py;
            arrPositions[i*3+2]=pz;
            mat4.translate(m,m,[px,py,pz]);

            // rotate to normal direction
            vec3.set(norm,nx,ny,nz );
            vec3.set(vm2,1,0,0);
            quat.rotationTo(q,vm2,norm);

            mat4.fromQuat(qMat, q);
            mat4.mul(m,m,qMat);


            // random rotate around up axis
            if(inRotateRandom.get())
            {
                var mr=mat4.create();
                var qbase=quat.create();
                quat.rotateX(qbase,qbase,Math.seededRandom()*360*CGL.DEG2RAD);
                mat4.fromQuat(mr,qbase);
                mat4.mul(m,m,mr);
            }

            // rotate -90 degree
            var mr2=mat4.create();
            var qbase2=quat.create();
            quat.rotateZ(qbase2,qbase2,-90*CGL.DEG2RAD);
            mat4.fromQuat(mr2,qbase2);
            mat4.mul(m,m,mr2);

            // scale
            if(inSizeMin.get()!=1.0 || inSizeMax!=1.0)
            {
                var sc=inSizeMin.get()+ ( Math.seededRandom()*(inSizeMax.get()-inSizeMin.get()) );
                mat4.scale(m,m,[sc,sc,sc]);
            }






            // //quaternion to euler, KINDA works, but not really :/
            // var finalq=q;//quat.create();
            // mat4.getRotation(finalq,m);

            // function clamp(v)
            // {
            //     return Math.min(1,Math.max(-1,v) ) ;
            // }

            // var yaw = Math.atan2(2.0*(finalq[1]*finalq[2] + finalq[3]*finalq[0]), finalq[3]*finalq[3] - finalq[0]*finalq[0] - finalq[1]*finalq[1] + finalq[2]*finalq[2]);
            // var pitch = Math.asin( clamp( -2.0*(finalq[0]*finalq[2] - finalq[3]*finalq[1])));
            // var roll = Math.atan2(2.0*(finalq[0]*finalq[1] + finalq[3]*finalq[2]), finalq[3]*finalq[3] + finalq[0]*finalq[0] - finalq[1]*finalq[1] - finalq[2]*finalq[2]);

            // arrRotations[i*3+0]=360-(pitch*CGL.RAD2DEG);
            // arrRotations[i*3+1]=360-(yaw*CGL.RAD2DEG);
            // arrRotations[i*3+2]=(roll*CGL.RAD2DEG);




            // save
            for(var a=0;a<16;a++)
            {
                matrixArray[i*16+a]=m[a];
            }
        }
    }
    else
    {
        console.error("geom is not indexed");
    }

    if(inDraw.get() && mesh)
    {
        if(op.patch.cgl.glVersion>=2)
        {
            mesh.numInstances=num;
            if(num>0)mesh.addAttribute('instMat',matrixArray,16);
        }
        recalc=false;
    }

    // outArrRotations.set(null);
    // outArrRotations.set(arrRotations);

    outArrPositions.set(null);
    outArrPositions.set(arrPositions);
}


var srcHeadVert=''
    .endl()+'UNI float do_instancing;'
    // .endl()+'UNI float MOD_scale;'

    .endl()+'#ifdef INSTANCING'
    .endl()+'   IN mat4 instMat;'
    .endl()+'   OUT mat4 instModelMat;'
    .endl()+'#endif';

var srcBodyVert=''
    .endl()+'#ifdef INSTANCING'
    .endl()+'   if(do_instancing==1.0)'
    .endl()+'   {'
    .endl()+'       mMatrix*=instMat;'
    .endl()+'   }'
    .endl()+'#endif'
    .endl();



inGeom.onChange=function()
{
    const g=inGeom.get()
    if(!g || !g.vertices)
    {
        mesh=null;
        return;
    }
    mesh=new CGL.Mesh(cgl,g);
    reset();
};

function removeModule()
{
    if(shader && mod)
    {
        shader.removeDefine('INSTANCING');
        shader.removeModule(mod);
        shader=null;
    }
}

function reset()
{
    recalc=true;
}

inDraw.onChange=function()
{
    if(!inDraw.get())
    {
        removeModule();
    }
}

function doRender()
{
    if(recalc)setup();
    if(!mesh) return;
    if(!inGeomSurface.get())return;
    if(!inDraw.get())return;
    if(!inGeom.get())return;


    if(op.patch.cgl.glVersion>=2)
    {
        if(cgl.getShader() && cgl.getShader()!=shader)
        {
            if(shader && mod)
            {
                shader.removeModule(mod);
                shader=null;
            }

            shader=cgl.getShader();
            if(!shader.hasDefine('INSTANCING'))
            {
                mod=shader.addModule(
                    {
                        title:op.objName,
                        name: 'MODULE_VERTEX_POSITION',
                        priority:-2,
                        srcHeadVert: srcHeadVert,
                        srcBodyVert: srcBodyVert
                    });

                shader.define('INSTANCING');
                uniDoInstancing=new CGL.Uniform(shader,'f','do_instancing',0);
            }
            else
            {
                uniDoInstancing=shader.getUniform('do_instancing');
            }
            setup();
        }

        uniDoInstancing.setValue(1);

        var limit=inNum.get();

        if(inDoLimit.get())
        {
            limit=inLimit.get();
            limit=Math.min(limit,inNum.get());
        }



        if(limit>=1)
        {
            mesh.numInstances=limit;
            mesh.render(shader);
        }
        uniDoInstancing.setValue(0);

    }
    else
    {
        // fallback - SLOW // should also use webgl1 extensions...

        for(var i=0;i<matrixArray.length;i+=16)
        {
            op.patch.cgl.pushModelMatrix();

            for(var j=0;j<16;j++)
                m[j]=matrixArray[i+j];

            mat4.multiply(cgl.mMatrix,cgl.mMatrix,m);

            mesh.render(cgl.getShader());
            op.patch.cgl.popModelMatrix();
        }
    }
}