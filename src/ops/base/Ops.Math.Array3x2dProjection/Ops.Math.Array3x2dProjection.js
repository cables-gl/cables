const
    exe=op.inTrigger("Exec"),
    inArr=op.inArray("Array3x"),
    fov=op.inValueFloat("fov",45),
    w=op.inValueFloat("w",1),
    h=op.inValueFloat("h",1),
    px=op.inValueFloat("Pos X",-0.5),
    py=op.inValueFloat("Pos Y",-0.5),
    coordmul=op.inValueFloat("mul"),
    outArr=op.outArray("Array2x");

exe.onTriggered=function()
{
    if(needsUpdate) update();
};

exe.onChange=
    inArr.onChange=
    fov.onChange=
    w.onChange=
    h.onChange=
    px.onChange=
    py.onChange=
    coordmul.onChange=update;

const cgl=op.patch.cgl;

var needsUpdate=false;

var minX=9999999;
var maxX=-9999999;
var minY=9999999;
var maxY=-9999999;


var pos=vec3.create();
var m=mat4.create();
var trans=vec3.create();
var pm=mat4.create();

function proj(p)
{
    pm=mat4.perspective(pm, fov.get()*CGL.DEG2RAD, 1, 0.0001, 100);

    mat4.multiply(m,cgl.vMatrix,cgl.mMatrix);
    vec3.transformMat4(pos, [px.get(),py.get(),0], m);
    vec3.add(pos,pos,p);

    vec3.transformMat4(trans, pos, pm);

    var height=h.get();
    var width=w.get();
    var x= trans[0] * width  ;
    var y= trans[1] * height ;

    return [x,y,0];
}



inArr.onChange=function()
{
    needsUpdate=true;
};

function update()
{
    var points3d=inArr.get();
    if(!points3d)return;

    var ind=0;
    var laserArr=[];
    var point=vec3.create();

    for(var i=0;i<points3d.length/3;i++)
    {

        vec3.set(point,
            points3d[i*3+0],
            points3d[i*3+1],
            points3d[i*3+2]
            );


        var vv=proj(point);

        var x=vv[0];
        var y=vv[1];
        if(x==null)x=0;
        if(y==null)y=0;

        x+=w.get()/2;
        y+=h.get()/2;

        minX=Math.min(x,minX);
        maxX=Math.max(x,maxX);

        minY=Math.min(y,minY);
        maxY=Math.max(y,maxY);


        laserArr[ind++] = x;
        laserArr[ind++] = y;
        laserArr[ind++] = 0;

    }

    outArr.set(null);
    outArr.set(laserArr);
    needsUpdate=false;

}
