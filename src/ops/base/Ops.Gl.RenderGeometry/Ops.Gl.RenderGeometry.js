const
    render=op.inTrigger('render'),
    geometry=op.inObject("Geometry"),
    updateAll=op.inValueBool('Update All',true),
    updateFaces=op.inValueBool('Update Face Indices',false),
    updateVerts=op.inValueBool('Update Vertices',false),
    updateTexcoords=op.inValueBool('Update Texcoords',false),
    vertNums=op.inValueBool('Vertex Numbers',true),
    trigger=op.outTrigger('trigger');

geometry.ignoreValueSerialize=true;

vertNums.onChange=
    geometry.onChange=update;

var mesh=null;

render.onTriggered=function()
{
    if(mesh) mesh.render(op.patch.cgl.getShader());
    trigger.trigger();
};


function update()
{
    var geom=geometry.get();
    if(geom)
    {
        if(mesh)mesh.dispose();
        if(!mesh)
        {
            mesh=new CGL.Mesh(op.patch.cgl,geom);
            mesh.addVertexNumbers=vertNums.get();
            mesh.setGeom(geom);
        }

        if(updateFaces.get() || updateAll.get())
            mesh.setVertexIndices(geom.verticesIndices);

        if(updateTexcoords.get() || updateAll.get())
            mesh.updateTexCoords(geom);

        if(updateVerts.get() || updateAll.get())
            mesh.updateVertices(geom);

        mesh.addVertexNumbers=vertNums.get();

        if(updateAll.get())
        {
            if(geom.hasOwnProperty('tangents') && geom.tangents && geom.tangents.length>0) mesh.setAttribute('attrTangent',geom.tangents,3);
            if(geom.hasOwnProperty('biTangents') && geom.biTangents && geom.biTangents.length>0) mesh.setAttribute('attrBiTangent',geom.biTangents,3);
        }
    }
    else
    {
        mesh=null;
    }
}

