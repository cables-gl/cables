const
    inExec=op.inTrigger("Exec"),
    inCapture=op.inTriggerButton("Capture"),
    outGeom=op.outObject("Geometry",null,"geometry"),

    next=op.outTrigger("Next");

const cgl=op.patch.cgl;
let shouldCapture=false;
let geom=null;

inCapture.onTriggered=()=>
{
    shouldCapture=true;
};

inExec.onTriggered=()=>
{

    if(shouldCapture)
    {

        geom=new CGL.Geometry();

        const old=CGL.Mesh.prototype.render;
        CGL.Mesh.prototype.render=meshCapture;

        next.trigger();

        CGL.Mesh.prototype.render=old;
        shouldCapture=false;

        outGeom.set(null);
        outGeom.set(geom);
    }

next.trigger();
};

function meshCapture()
{
    console.log("capy!",this._geom);

    const g=this._geom.copy();

    for(let i=0;i<g.vertices.length;i+=3)
    {
        const v=[g.vertices[i+0],g.vertices[i+1],g.vertices[i+2]];

        vec3.transformMat4(v,v,cgl.mMatrix);

        g.vertices[i+0]=v[0];
        g.vertices[i+1]=v[1];
        g.vertices[i+2]=v[2];
    }

    console.log(g.vertices,this._geom.vertices);
    geom.merge(g);
}