const
    TAU = Math.PI * 2,
    cgl = op.patch.cgl,
    inTrigger = op.inTrigger("render"),
    inRadius = op.inValue("radius", 1),
    inStacks = op.inValue("stacks", 32),
    inSlices = op.inValue("slices", 32),
    inStacklimit = op.inValueSlider("Filloffset", 1),
    inDraw = op.inValueBool("Render", true),
    outTrigger = op.outTrigger("trigger"),
    outGeometry = op.outObject("geometry"),
    UP = vec3.fromValues(0,1,0),
    RIGHT = vec3.fromValues(1,0,0)
;

var
    geom = new CGL.Geometry("Sphere"),
    tmpNormal = vec3.create(),
    tmpVec = vec3.create(),
    needsRebuild = true,
    mesh
;

function buildMesh () {
    const
        stacks = Math.max(inStacks.get(),2),
        slices = Math.max(inSlices.get(),3),
        stackLimit = Math.min(Math.max(inStacklimit.get()*stacks,1),stacks),
        radius = inRadius.get()
    ;

    var
        positions = [],
        texcoords = [],
        normals = [],
        tangents = [],
        biTangents = [],
        indices = [],
        x,y,z,d,t,a,
        o,u,v,i,j
    ;

    for (i = o = 0; i < stacks + 1; i++) {
        v = (i/stacks-.5)*Math.PI;
        y = Math.sin(v);
        a = Math.cos(v);
        for (j = 0; j < slices+1; j++) {
            u = (j/slices)*TAU;
            x = Math.cos(u)*a;
            z = Math.sin(u)*a;

            positions.push(x*radius,y*radius,z*radius);
            texcoords.push(i/(stacks+1),j/slices);

            d = Math.sqrt(x*x+y*y+z*z);
            normals.push(
                tmpNormal[0] = x/d,
                tmpNormal[1] = y/d,
                tmpNormal[2] = z/d
            );

            if (y == d) t = RIGHT;
            else t = UP;
            vec3.cross(tmpVec, tmpNormal, t);
            vec3.normalize(tmpVec,tmpVec);
            Array.prototype.push.apply(tangents, tmpVec);
            vec3.cross(tmpVec, tmpVec, tmpNormal);
            Array.prototype.push.apply(biTangents, tmpVec);
        }
        if (i == 0 || i > stackLimit) continue;
        for(j = 0; j < slices; j++,o++) {
            indices.push(
                o,o+1,o+slices+1,
                o+1,o+slices+2,o+slices+1
            );
        }
        o++;
    }

    // set geometry
    geom.clear();
    geom.vertices = positions;
    geom.texCoords = texcoords;
    geom.vertexNormals = normals;
    geom.tangents = tangents;
    geom.biTangents = biTangents;
    geom.verticesIndices = indices;

    outGeometry.set(null);
    outGeometry.set(geom);

    if (!mesh) mesh = new CGL.Mesh(cgl, geom);
    else mesh.setGeom(geom);

    needsRebuild = false;
}

// set event handlers
inTrigger.onTriggered = function () {
    if (needsRebuild) buildMesh();
    if (inDraw.get()) mesh.render(cgl.getShader());
    outTrigger.trigger();
};

inStacks.onChange =
inSlices.onChange =
inStacklimit.onChange =
inRadius.onChange = function() {
    // only calculate once, even after multiple settings could were changed
    needsRebuild = true;
};

// set lifecycle handlers
op.onDelete = function () { if(mesh)mesh.dispose(); };
