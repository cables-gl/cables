var self=this;
var cgl=this.patch.cgl;

this.name='random cluster instanced';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var geom=this.addInPort(new Port(this,"geom",OP_PORT_TYPE_OBJECT));
geom.ignoreValueSerialize=true;

var num=this.addInPort(new Port(this,"num"));
var size=this.addInPort(new Port(this,"size"));
var seed=this.addInPort(new Port(this,"random seed"));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION)) ;
var idx=this.addOutPort(new Port(this,"index")) ;
var rnd=this.addOutPort(new Port(this,"rnd")) ;
var randoms=[];
var randomsRot=[];
var randomsFloats=[];

var scaleX=this.addInPort(new Port(this,"scaleX",OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleY=this.addInPort(new Port(this,"scaleY",OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleZ=this.addInPort(new Port(this,"scaleZ",OP_PORT_TYPE_VALUE,{ display:'range' }));
scaleX.set(1);
scaleY.set(1);
scaleZ.set(1);

var transVec=vec3.create();

var transformations=[];
var mod=null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;

var srcHeadVert=''
    .endl()+'uniform float do_instancing;'
    .endl()+'#ifdef INSTANCING'
    .endl()+'   attribute mat4 instMat;'
    .endl()+'#endif'
    .endl();

var srcBodyVert=''
    .endl()+'#ifdef INSTANCING'
    .endl()+'   if( do_instancing==1.0 ) '
    .endl()+'       pos=instMat*pos;'
    .endl()+'#endif'
    .endl();


function prepare()
{

    // if(trigger.isLinked()) trigger.trigger();
    if(geom.get())
    {
        reset();
        console.log('prepare instances!!');
        var num=transformations.length;
        var arrs = [].concat.apply([], transformations);
        var matrices = new Float32Array(arrs);
    
        mesh=new CGL.Mesh(cgl,geom.get());
        mesh.numInstances=num;
        mesh.addAttribute('instMat',matrices,16);

        console.log(num+' instances !',arrs.length);
    }

}


function doRender()
{
    
    if(mesh)
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
                        name: 'MODULE_VERTEX_POSITION',
                        srcHeadVert: srcHeadVert,
                        srcBodyVert: srcBodyVert
                    });
        
                shader.define('INSTANCING');    
                uniDoInstancing=new CGL.Uniform(shader,'f','do_instancing',0);
            }
            else
            {
                uniDoInstancing=shader.getUniform('do_instancing')
            }
        }

        uniDoInstancing.setValue(1);
        
        mesh.render(shader);
        
        uniDoInstancing.setValue(0);
        
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

    for(i=0;i<num.get();i++)
    {
        randomsFloats.push(Math.seededRandom());
        randoms.push(vec3.fromValues(
            scaleX.get()*((Math.seededRandom()-0.5)*size.get()),
            scaleY.get()*((Math.seededRandom()-0.5)*size.get()),
            scaleZ.get()*((Math.seededRandom()-0.5)*size.get())
            ));
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

        mat4.rotateX(m,m, randomsRot[i][0]);
        mat4.rotateY(m,m, randomsRot[i][1]);
        mat4.rotateZ(m,m, randomsRot[i][2]);
        
        var vScale=vec3.create();
        var sc=0.25+0.75*Math.seededRandom();
        vec3.set(vScale,sc,sc,sc);

        mat4.scale(m,m, vScale);

        transformations.push( Array.prototype.slice.call(m) );

    }

    console.log( transformations);
}

size.set(40);
seed.set(1);
seed.onValueChange(prepare);
num.onValueChange(prepare);
size.onValueChange(prepare);
scaleX.onValueChange(prepare);
scaleZ.onValueChange(prepare);
scaleY.onValueChange(prepare);
geom.onValueChange(prepare);

num.set(100);