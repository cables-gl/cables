const cgl = op.patch.cgl;

let exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
let geom = op.addInPort(new CABLES.Port(op, "geom", CABLES.OP_PORT_TYPE_OBJECT));
geom.ignoreValueSerialize = true;

// var num=op.addInPort(new CABLES.Port(op,"num"));
let num = op.inValueInt("num");
let size = op.addInPort(new CABLES.Port(op, "size"));
let seed = op.addInPort(new CABLES.Port(op, "random seed"));

// var trigger=op.addOutPort(new CABLES.Port(op,"trigger",CABLES.OP_PORT_TYPE_FUNCTION)) ;
let idx = op.addOutPort(new CABLES.Port(op, "index"));
let rnd = op.addOutPort(new CABLES.Port(op, "rnd"));
let positions = op.inArray("Positions");
let randoms = [];
let randomsRot = [];
let randomsFloats = [];

let scaleX = op.addInPort(new CABLES.Port(op, "scaleX", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let scaleY = op.addInPort(new CABLES.Port(op, "scaleY", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
let scaleZ = op.addInPort(new CABLES.Port(op, "scaleZ", CABLES.OP_PORT_TYPE_VALUE, { "display": "range" }));
scaleX.set(1);
scaleY.set(1);
scaleZ.set(1);

let anim = op.inValue("time");

let transVec = vec3.create();

let transformations = [];
let mod = null;
let mesh = null;
let shader = null;
let uniDoInstancing = null;

size.set(40);
seed.set(1);
positions.onChange = prepare;
seed.onChange = prepare;
num.onChange = prepare;
size.onChange = prepare;
scaleX.onChange = prepare;
scaleZ.onChange = prepare;
scaleY.onChange = prepare;
geom.onChange = prepare;

num.set(100);

let srcHeadVert = ""
    .endl() + "UNI float do_instancing;"
    .endl() + "UNI float {{mod}}_time;"
    .endl() + "#ifdef INSTANCING"
    .endl() + "   IN mat4 instMat;"
    .endl() + "#endif"

    .endl() + "float osci(float v)"
    .endl() + "{"
    .endl() + "   v=mod(v,1.0);"
    .endl() + "   if(v>0.5)v=1.0-v;"
    .endl() + "   return smoothstep(0.0,1.0,v*2.0);"
    .endl() + "}"

    .endl();

let srcBodyVert = ""

    .endl() + "#ifdef INSTANCING"
    .endl() + "   pos.x*=osci( mod( {{mod}}_time+instMat[0].x*instMat[0].x ,1.0))*0.8+0.23;"
    .endl() + "   pos.y*=osci( mod( {{mod}}_time+instMat[0].x*instMat[0].x ,1.0))*0.8+0.23;"
    .endl() + "   pos.z*=osci( mod( {{mod}}_time+instMat[0].x*instMat[0].x ,1.0))*0.8+0.23;"
    .endl() + "       mvMatrix*=instMat;"
    .endl() + "#endif"
    .endl();

function prepare()
{
    // if(trigger.isLinked()) trigger.trigger();
    if (geom.get())
    {
        reset();

        let num = transformations.length;
        let arrs = [].concat.apply([], transformations);
        let matrices = new Float32Array(arrs);

        if (mesh)mesh.dispose();
        mesh = new CGL.Mesh(cgl, geom.get());
        mesh.numInstances = num;
        mesh.setAttribute("instMat", matrices, 16);
    }
}

let uniTime = null;

function removeModule()
{
    if (shader)
    {
        shader.removeModule(mod);
        shader.removeDefine("INSTANCING");
    }
    shader = null;
}

exe.onLinkChanged = removeModule;

function doRender()
{
    if (mesh)
    {
        if (cgl.getShader() && cgl.getShader() != shader)
        {
            removeModule();

            shader = cgl.getShader();
            // if(!shader.hasDefine('INSTANCING'))
            {
                mod = shader.addModule(
                    {
                        "title": op.objName,
                        "name": "MODULE_VERTEX_POSITION",
                        "srcHeadVert": srcHeadVert,
                        "srcBodyVert": srcBodyVert
                    });

                shader.define("INSTANCING");
                // uniDoInstancing=new CGL.Uniform(shader,'f','do_instancing',0);
            }
            // else
            // {
            //     uniDoInstancing=shader.getUniform('do_instancing');
            // }
            if (mod)uniTime = new CGL.Uniform(shader, "f", mod.prefix + "_time", anim);
        }

        if (!uniDoInstancing) return;

        // uniDoInstancing.setValue(1);
        mesh.render(shader);
        // uniDoInstancing.setValue(0);
    }
    else
    {
        prepare();
    }
}

exe.onTriggered = doRender;

function reset()
{
    let i = 0;
    randoms.length = 0;
    randomsRot.length = 0;
    randomsFloats.length = 0;

    Math.randomSeed = seed.get();

    let posArr = positions.get();
    if (posArr) num.set(posArr.length / 3);

    for (i = 0; i < num.get(); i++)
    {
        randomsFloats.push(Math.seededRandom());

        if (posArr)
        {
            if (posArr.length > i * 3)
            {
                randoms.push(vec3.fromValues(
                    posArr[i * 3 + 0],
                    posArr[i * 3 + 1],
                    posArr[i * 3 + 2]));
            }
            else
            {
                randoms.push(vec3.fromValues(0, 0, 0));
            }
        }
        else
        {
            randoms.push(vec3.fromValues(
                scaleX.get() * ((Math.seededRandom()) * size.get() - (size.get() / 2)),
                scaleY.get() * ((Math.seededRandom()) * size.get() - (size.get() / 2)),
                scaleZ.get() * ((Math.seededRandom()) * size.get() - (size.get() / 2))
            ));
        }

        randomsRot.push(vec3.fromValues(
            Math.seededRandom() * 360 * CGL.DEG2RAD,
            Math.seededRandom() * 360 * CGL.DEG2RAD,
            Math.seededRandom() * 360 * CGL.DEG2RAD
        ));
    }

    transformations.length = 0;

    let m = mat4.create();
    for (i = 0; i < randoms.length; i++)
    {
        mat4.identity(m);
        mat4.translate(m, m, randoms[i]);

        let vScale = vec3.create();
        let sc = Math.seededRandom();
        vec3.set(vScale, sc, sc, sc);
        mat4.scale(m, m, vScale);

        mat4.rotateX(m, m, randomsRot[i][0]);
        mat4.rotateY(m, m, randomsRot[i][1]);
        mat4.rotateZ(m, m, randomsRot[i][2]);

        transformations.push(Array.prototype.slice.call(m));
    }
}
