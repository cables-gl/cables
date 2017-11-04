op.name="Instancer";

var exe=op.inFunction("Render");
var geom=op.inObject("Geometry");

var num=op.inValueInt("Count",1000);
var size=op.inValue("size",10);
var spread=op.inValue("Spread",0);

var shape=op.inValueSelect('Shape',["Cube","Sphere","Torus"]);

var seed=op.inValue("random seed",1);

var scaleX=op.inValueSlider("Scale X",1);
var scaleY=op.inValueSlider("Scale Y",1);
var scaleZ=op.inValueSlider("Scale Z",1);

spread.onChange=
    shape.onChange=
    num.onChange=
    size.onChange=
    geom.onChange=
    scaleX.onChange=
    scaleZ.onChange=
    scaleY.onChange=
    geom.onChange=
    seed.onChange=prepareLater;

var randoms=[];
var randomsRot=[];


var cgl=op.patch.cgl;

var anim=op.inValue("time");

var transVec=vec3.create();

var transformations=[];
var mod=null;
var mesh=null;
var shader=null;
var uniTime=null;
exe.onLinkChanged=removeModule;
exe.onTriggered=doRender;
var needsPrepare=true;

function prepareLater()
{
    needsPrepare=true;    
}

function prepare()
{

    if(geom.get())
    {
        reset();

        var num=transformations.length;
        var arrs = [].concat.apply([], transformations);
        var matrices = new Float32Array(arrs);

        mesh=new CGL.Mesh(cgl,geom.get());
        mesh.numInstances=num;
        mesh.setAttribute('instMat',matrices,16);
        needsPrepare=false;
    }
}


function removeModule()
{
    if(shader)
    {
        shader.removeModule(mod);
        shader.removeDefine('INSTANCING');
    }
    shader=null;
}


function doRender()
{
    if(needsPrepare)prepare();
    
    if(mesh)
    {
        if(cgl.getShader() && cgl.getShader()!=shader)
        {
            if(shader && mod)
            {
                removeModule();
                shader=null;
            }

            shader=cgl.getShader();

            mod=shader.addModule(
                {
                    title:op.objName,
                    name: 'MODULE_VERTEX_POSITION',
                    srcHeadVert: attachments.rinstancer_head_vert,
                    srcBodyVert: attachments.rinstancer_body_vert
                });

            shader.define('INSTANCING');

            if(mod)uniTime=new CGL.Uniform(shader,'f',mod.prefix+'_time',anim);
        }

        mesh.render(shader);
    }
    else
    {
        prepare();
    }
}


function reset()
{
    var i=0;
    randoms.length=0;
    randomsRot.length=0;

    Math.randomSeed=seed.get();


    if(shape.get()=="Sphere")
    {
        var tempv=vec3.create();
        for(i=0;i<num.get();i++)
        {
            rndq=[Math.seededRandom(),Math.seededRandom(),Math.seededRandom(),Math.seededRandom()];
            quat.normalize(rndq,rndq);
            
            if(i%2===0) tempv[0]=-size.get()/2;
                else tempv[0]=size.get()/2;
            
            tempv[0]*=Math.seededRandom();
            tempv[1]=0;
            tempv[2]=0;

            vec3.transformQuat(tempv, tempv, rndq) ;
            randoms.push(vec3.fromValues(tempv[0],tempv[1],tempv[2] ));
        }
    }
    else
    if(shape.get()=="Torus")
    {

        for(i=0;i<num.get();i++)
        {
            var rad = (Math.seededRandom()*360)*CGL.DEG2RAD;
            var posx=Math.cos(rad)*size.get();
            var posy=Math.sin(rad)*size.get();
            var posz=0;

            randoms.push(vec3.fromValues(posx,posy,posz ));
        }
    }
    else
    {
        // CUBE 
        for(i=0;i<num.get();i++)
        {
            randoms.push(vec3.fromValues(
                scaleX.get()*((Math.seededRandom())*size.get()-(size.get()/2)),
                scaleY.get()*((Math.seededRandom())*size.get()-(size.get()/2)),
                scaleZ.get()*((Math.seededRandom())*size.get()-(size.get()/2))
                ));
        }
    }

    
    for(i=0;i<num.get();i++)
    {
        randomsRot.push(vec3.fromValues(
        Math.seededRandom()*360*CGL.DEG2RAD,
        Math.seededRandom()*360*CGL.DEG2RAD,
        Math.seededRandom()*360*CGL.DEG2RAD
        ));
    }
    
    transformations.length=0;

    var m=mat4.create();
    for(i=0;i<randoms.length;i++)
    {
        
        randoms[i][0]+=(2*(0.5-Math.seededRandom()))*spread.get();
        randoms[i][1]+=(2*(0.5-Math.seededRandom()))*spread.get();
        randoms[i][2]+=(2*(0.5-Math.seededRandom()))*spread.get();
        
        mat4.identity(m);
        
        mat4.translate(m,m, randoms[i]);

        var vScale=vec3.create();
        var sc=Math.seededRandom();
        vec3.set(vScale,sc,sc,sc);
        mat4.scale(m,m, vScale);

        mat4.rotateX(m,m, randomsRot[i][0]);
        mat4.rotateY(m,m, randomsRot[i][1]);
        mat4.rotateZ(m,m, randomsRot[i][2]);

        transformations.push( Array.prototype.slice.call(m) );
    }

}

