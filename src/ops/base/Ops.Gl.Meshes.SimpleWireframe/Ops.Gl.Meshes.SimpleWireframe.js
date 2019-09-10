const
    render=op.inTrigger("Render"),
    inGeom=op.inObject("Geometry"),
    next=op.outTrigger("Next")
    ;

const cgl=op.patch.cgl;

op.toWorkPortsNeedToBeLinked(inGeom);

render.onTriggered=doRender;

var mesh=null;
var verts=[];
var tc=[];
var normals=[];
var prim=cgl.gl.LINE_STRIP;

inGeom.onChange=function()
{
    var geom=inGeom.get();
    if(!geom)
    {
        mesh=null;
        return;
    }

    verts.length=0;
    normals.length=0;
    tc.length=0;
    var i=0;

    if(geom.isIndexed())
    {
        for(i=0;i<geom.verticesIndices.length;i+=3)
        {
            var index=geom.verticesIndices[i+0];
            var index1=geom.verticesIndices[i+1];
            var index2=geom.verticesIndices[i+2];

            verts.push(geom.vertices[index*3+0],geom.vertices[index*3+1],geom.vertices[index*3+2]);
            verts.push(geom.vertices[index1*3+0],geom.vertices[index1*3+1],geom.vertices[index1*3+2]);
            verts.push(geom.vertices[index1*3+0],geom.vertices[index1*3+1],geom.vertices[index1*3+2]);
            verts.push(geom.vertices[index2*3+0],geom.vertices[index2*3+1],geom.vertices[index2*3+2]);
            verts.push(geom.vertices[index2*3+0],geom.vertices[index2*3+1],geom.vertices[index2*3+2]);
            verts.push(geom.vertices[index*3+0],geom.vertices[index*3+1],geom.vertices[index*3+2]);

            normals.push(geom.vertexNormals[index*3+0],geom.vertexNormals[index*3+1],geom.vertexNormals[index*3+2]);
            normals.push(geom.vertexNormals[index1*3+0],geom.vertexNormals[index1*3+1],geom.vertexNormals[index1*3+2]);
            normals.push(geom.vertexNormals[index1*3+0],geom.vertexNormals[index1*3+1],geom.vertexNormals[index1*3+2]);
            normals.push(geom.vertexNormals[index2*3+0],geom.vertexNormals[index2*3+1],geom.vertexNormals[index2*3+2]);
            normals.push(geom.vertexNormals[index2*3+0],geom.vertexNormals[index2*3+1],geom.vertexNormals[index2*3+2]);
            normals.push(geom.vertexNormals[index*3+0],geom.vertexNormals[index*3+1],geom.vertexNormals[index*3+2]);

            tc.push(geom.texCoords[index*2+0],geom.texCoords[index*2+1]);
            tc.push(geom.texCoords[index1*2+0],geom.texCoords[index1*2+1]);
            tc.push(geom.texCoords[index1*2+0],geom.texCoords[index1*2+1]);
            tc.push(geom.texCoords[index2*2+0],geom.texCoords[index2*2+1]);
            tc.push(geom.texCoords[index2*2+0],geom.texCoords[index2*2+1]);
            tc.push(geom.texCoords[index*2+0],geom.texCoords[index*2+1]);
        }
        prim=cgl.gl.LINES;
    }
    else
    {
        for(i=0;i<geom.vertices.length;i+=9)
        {
            verts.push(geom.vertices[i+0],geom.vertices[i+1],geom.vertices[i+2]);
            verts.push(geom.vertices[i+3],geom.vertices[i+4],geom.vertices[i+5]);

            verts.push(geom.vertices[i+3],geom.vertices[i+4],geom.vertices[i+5]);
            verts.push(geom.vertices[i+6],geom.vertices[i+7],geom.vertices[i+8]);

            verts.push(geom.vertices[i+6],geom.vertices[i+7],geom.vertices[i+8]);
            verts.push(geom.vertices[i+0],geom.vertices[i+1],geom.vertices[i+2]);
        }

        prim=cgl.gl.LINES;
    }

    geom=new CGL.Geometry("wireframelinegeom");
    // if(verts.length>60000)geom.setVertices(verts);
    // else
    geom.setVertices(verts);
    geom.setTexCoords(tc);
    geom.vertexNormals=normals;

    mesh=new CGL.Mesh(cgl,geom,prim);
};


function doRender()
{
    var shader=cgl.getShader();
    if(!shader)return;

    var oldPrim=shader.glPrimitive;
    shader.glPrimitive=prim;
    if(mesh) mesh.render(shader);
    shader.glPrimitive=oldPrim;
    next.trigger();
}