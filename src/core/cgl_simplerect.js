
var CGL=CGL||{};
CGL.MESHES=CGL.MESHES||{};

CGL.MESHES.getSimpleRect=function(cgl,name)
{
    var geom=new CGL.Geometry(name);

    geom.vertices = [
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
         1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];

    geom.texCoords = [
         1.0, 1.0,
         0.0, 1.0,
         1.0, 0.0,
         0.0, 0.0
    ];

    geom.verticesIndices = [
        0, 1, 2,
        2, 1, 3
    ];
    
    return new CGL.Mesh(cgl,geom);
}
