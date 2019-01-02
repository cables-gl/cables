const
    exe=op.inTrigger("exe"),
    num=op.inValueInt("num"),
    size=op.inValueFloat("size",10),
    seed=op.inValueFloat("random seed",1),
    round=op.inValueBool('round',false),
    scaleX=op.inValueFloat("scaleX",1),
    scaleY=op.inValueFloat("scaleY",1),
    scaleZ=op.inValueFloat("scaleZ",1),
    trigger=op.outTrigger("trigger"),
    idx=op.outValue("index"),
    rnd=op.outValue("rnd"),
    rotX=op.inValueSlider("Rotate X",1),
    rotY=op.inValueSlider("Rotate Y",1),
    rotZ=op.inValueSlider("Rotate Z",1),
    scrollX=op.inValue("Scroll X",0);

op.setPortGroup("Scaling",[scaleX,scaleY,scaleZ]);
op.setPortGroup("Rotation",[rotX,rotY,rotZ]);
op.setPortGroup("Parameters",[num,size,round,seed]);
op.toWorkPortsNeedToBeLinked(exe,trigger);

const cgl=op.patch.cgl;
var randoms=[];
var origRandoms=[];
var randomsRot=[];
var randomsFloats=[];

var transVec=vec3.create();
var mat=mat4.create();

function doRender()
{
    // console.log(doRender);
    if(op.instanced(exe))return;

    if(CABLES.UI && CABLES.UI.renderHelper)
    {
        CABLES.GL_MARKER.drawCube(op,
            size.get()/2*scaleX.get(),
            size.get()/2*scaleY.get(),
            size.get()/2*scaleZ.get());
    }

    op.patch.instancing.pushLoop(randoms.length);

    if(scrollX.get()!=0)
    {
        for(var i=0;i<origRandoms.length;i++)
        {
            randoms[i][0]=origRandoms[i][0]+scrollX.get();
            randoms[i][0]=(randoms[i][0]%size.get())-(size.get()/2);
        }
    }

    for(var i=0;i<randoms.length;i++)
    {
        cgl.pushModelMatrix();

        mat4.translate(cgl.mMatrix,cgl.mMatrix, randoms[i]);

        mat4.rotateX(cgl.mMatrix,cgl.mMatrix, randomsRot[i][0]);
        mat4.rotateY(cgl.mMatrix,cgl.mMatrix, randomsRot[i][1]);
        mat4.rotateZ(cgl.mMatrix,cgl.mMatrix, randomsRot[i][2]);

        idx.set(i);
        rnd.set(randomsFloats[i]);

        trigger.trigger();
        op.patch.instancing.increment();

        cgl.popModelMatrix();
    }
    op.patch.instancing.popLoop();

}

exe.onTriggered=doRender;

function getRandomPos()
{
    return vec3.fromValues(
        scaleX.get()*(Math.seededRandom()-0.5)*size.get(),
        scaleY.get()*(Math.seededRandom()-0.5)*size.get(),
        scaleZ.get()*(Math.seededRandom()-0.5)*size.get()
        );
}


function reset()
{
    randoms.length=0;
    randomsRot.length=0;
    randomsFloats.length=0;
    origRandoms.length=0;

    Math.randomSeed=seed.get();

    var makeRound=round.get();

    for(var i=0;i<num.get();i++)
    {
        randomsFloats.push(Math.seededRandom());

        var v=getRandomPos();

        if(makeRound)
            while(vec3.len(v)>size.get()/2)
                v=getRandomPos();

        origRandoms.push( [ v[0],v[1],v[2] ]);
        randoms.push(v);

        randomsRot.push(vec3.fromValues(
            Math.seededRandom()*360*CGL.DEG2RAD*rotX.get(),
            Math.seededRandom()*360*CGL.DEG2RAD*rotY.get(),
            Math.seededRandom()*360*CGL.DEG2RAD*rotZ.get()
            ));
    }
}

seed.onChange=reset;
num.onChange=reset;
size.onChange=reset;
scaleX.onChange=reset;
scaleZ.onChange=reset;
scaleY.onChange=reset;
round.onChange=reset;
rotX.onChange=reset;
rotY.onChange=reset;
rotZ.onChange=reset;

num.set(100);