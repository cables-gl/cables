import { Mesh } from "./cgl_mesh";
import Geometry from "./cgl_geom";

// 
// var CGL=CGL||{};
// CGL.MESHES=CGL.MESHES||{};
const MESHES = {};

MESHES.getSimpleRect=function(cgl,name)
{
    var geom=new Geometry(name);

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
    
    return new Mesh(cgl,geom);
}

export default MESHES;
