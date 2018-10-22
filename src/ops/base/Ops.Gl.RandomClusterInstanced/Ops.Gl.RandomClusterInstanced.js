const cgl=op.patch.cgl;

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var geom=op.addInPort(new Port(op,"geom",OP_PORT_TYPE_OBJECT));
geom.ignoreValueSerialize=true;

// var num=op.addInPort(new Port(op,"num"));
var num=op.inValueInt("num");
var size=op.addInPort(new Port(op,"size"));
var seed=op.addInPort(new Port(op,"random seed"));

// var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION)) ;
var idx=op.addOutPort(new Port(op,"index")) ;
var rnd=op.addOutPort(new Port(op,"rnd")) ;
var positions=op.inArray("Positions");
var randoms=[];
var randomsRot=[];
var randomsFloats=[];

var scaleX=op.addInPort(new Port(op,"scaleX",OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleY=op.addInPort(new Port(op,"scaleY",OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleZ=op.addInPort(new Port(op,"scaleZ",OP_PORT_TYPE_VALUE,{ display:'range' }));
scaleX.set(1);
scaleY.set(1);
scaleZ.set(1);

var anim=op.inValue("time");

var transVec=vec3.create();

var transformations=[];
var mod=null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;


size.set(40);
seed.set(1);
positions.onChange=prepare;
seed.onChange=prepare;
num.onChange=prepare;
size.onChange=prepare;
scaleX.onChange=prepare;
scaleZ.onChange=prepare;
scaleY.onChange=prepare;
geom.onChange=prepare;

num.set(100);



var srcHeadVert=''
    .endl()+'UNI float do_instancing;'
    .endl()+'UNI float {{mod}}_time;'
    .endl()+'#ifdef INSTANCING'
    .endl()+'   IN mat4 instMat;'
    // .endl()+'   OUT mat4 instModelMat;'
    .endl()+'#endif'

    .endl()+'float osci(float v)'
    .endl()+'{'
    .endl()+'   v=mod(v,1.0);'
    .endl()+'   if(v>0.5)v=1.0-v;'
    .endl()+'   return smoothstep(0.0,1.0,v*2.0);'
    .endl()+'}'

    .endl();

var srcBodyVert=''

    .endl()+'#ifdef INSTANCING'
    // .endl()+'       instModelMat=instMat;'
    .endl()+'   pos.x*=osci( mod( {{mod}}_time+instMat[0].x*instMat[0].x ,1.0))*0.8+0.23;'
    .endl()+'   pos.y*=osci( mod( {{mod}}_time+instMat[0].x*instMat[0].x ,1.0))*0.8+0.23;'
    .endl()+'   pos.z*=osci( mod( {{mod}}_time+instMat[0].x*instMat[0].x ,1.0))*0.8+0.23;'
    // .endl()+'       mvMatrix=viewMatrix*modelMatrix*instMat;'
    // .endl()+'       mat4 instModelMat=instMat;'
    .endl()+'       mvMatrix*=instMat;'
    .endl()+'#endif'
    .endl();



function prepare()
{

    // if(trigger.isLinked()) trigger.trigger();
    if(geom.get())
    {
        reset();

        var num=transformations.length;
        var arrs = [].concat.apply([], transformations);
        var matrices = new Float32Array(arrs);

        if(mesh)mesh.dispose();
        mesh=new CGL.Mesh(cgl,geom.get());
        mesh.numInstances=num;
        mesh.setAttribute('instMat',matrices,16);
    }
}

var uniTime=null;

function removeModule()
{
    if(shader)
    {
        shader.removeModule(mod);
        shader.removeDefine('INSTANCING');
    }
    shader=null;
}

exe.onLinkChanged=removeModule;

function doRender()
{

    if(mesh)
    {
        if(cgl.getShader() && cgl.getShader()!=shader)
        {
            removeModule();

            shader=cgl.getShader();
            // if(!shader.hasDefine('INSTANCING'))
            {
                mod=shader.addModule(
                    {
                        title:op.objName,
                        name: 'MODULE_VERTEX_POSITION',
                        srcHeadVert: srcHeadVert,
                        srcBodyVert: srcBodyVert
                    });

                shader.define('INSTANCING');
                // uniDoInstancing=new CGL.Uniform(shader,'f','do_instancing',0);

            }
            // else
            // {
            //     uniDoInstancing=shader.getUniform('do_instancing');
            // }
            if(mod)uniTime=new CGL.Uniform(shader,'f',mod.prefix+'_time',anim);
        }

        if(!uniDoInstancing)return;

        // uniDoInstancing.setValue(1);
        mesh.render(shader);
        // uniDoInstancing.setValue(0);
    }
    else
    {
        prepare();
    }
}

exe.onTriggered=doRender;

function reset()
{
    var i=0;
    randoms.length=0;
    randomsRot.length=0;
    randomsFloats.length=0;

    Math.randomSeed=seed.get();

    var posArr=positions.get();
    if(posArr) num.set(posArr.length/3);


    for(i=0;i<num.get();i++)
    {
        randomsFloats.push(Math.seededRandom());

        if(posArr)
        {
            if(posArr.length>i*3)
            {
                randoms.push(vec3.fromValues(
                    posArr[i*3+0],
                    posArr[i*3+1],
                    posArr[i*3+2]));
            }
            else
            {
                randoms.push(vec3.fromValues(0,0,0));
            }
        }
        else
        {
            randoms.push(vec3.fromValues(
                scaleX.get()*((Math.seededRandom())*size.get()-(size.get()/2)),
                scaleY.get()*((Math.seededRandom())*size.get()-(size.get()/2)),
                scaleZ.get()*((Math.seededRandom())*size.get()-(size.get()/2))
                ));

        }

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
