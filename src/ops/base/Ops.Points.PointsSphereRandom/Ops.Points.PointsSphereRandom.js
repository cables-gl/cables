const
    num=op.inValueInt("Amount of points",1000),
    size=op.inValue("Sphere size",1),
    seed=op.inValue("Random seed",0),
    distRand=op.inValueSlider("Random distance from sphere",0),
    distrib=op.inValueSelect('Distribution',["Uniform","Poles","Half"],"Uniform"),
    outArray=op.outArray("Array out"),
    totalPointsOut=op.outNumber("Total points"),
    arrayLengthOut=op.outNumber("Array length");


var newArr=[];
outArray.set(newArr);

var newArr = [];

seed.onChange=
num.onChange=
size.onChange=
distrib.onChange=
distRand.onChange=generate;

function generate()
{

    const verts=[];
    verts.length=Math.round(num.get())*3;

    Math.randomSeed=seed.get();

    var rndq = quat.create();
    var tempv = vec3.create();

    var dist=0;
    if(distrib.get()=="Poles")dist=1;
    if(distrib.get()=="Half")dist=2;

    var dRand=distRand.get();

    for(var i=0;i<num.get();i++)
    {
        if(dist==1 || dist==2)
        {
            rndq[0]=Math.seededRandom();
            rndq[1]=Math.seededRandom();
            rndq[2]=Math.seededRandom();
            rndq[3]=Math.seededRandom();
        }
        else
        {
            rndq[0]=Math.seededRandom()*2.0-1.0;
            rndq[1]=Math.seededRandom()*2.0-1.0;
            rndq[2]=Math.seededRandom()*2.0-1.0;
            rndq[3]=Math.seededRandom()*2.0-1.0;
        }

        quat.normalize(rndq,rndq);

        if(dist==2)
        {
            tempv[0]=size.get();
        }
        else
        {
            if(i%2===0) tempv[0]=-size.get();
                else tempv[0]=size.get();
        }

        tempv[1]=0;
        tempv[2]=0;

        if(dRand!==0) tempv[0]-=Math.random()*dRand;

        vec3.transformQuat(tempv, tempv, rndq) ;
        verts[i*3]=tempv[0];
        verts[i*3+1]=tempv[1];
        verts[i*3+2]=tempv[2];

    }

    outArray.set(null);
    outArray.set(verts);
    totalPointsOut.set(verts.length/3);
    arrayLengthOut.set(verts.length);
}

