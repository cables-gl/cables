const
    inRender = op.inTrigger("render"),
    inDraw = op.inValueBool("Draw",true),
    inSegments = op.inValueInt("segments", 40),
    inStacks = op.inValueInt("stacks", 1),
    inLength = op.inValueFloat("length", 1),
    inOuterRadius = op.inValueFloat("outer radius", 0.5),
    inInnerRadius = op.inValueFloat("inner radius", 0),
    inUVMode = op.inValueSelect("UV mode", ["simple","atlas"],"simple"),
    flipSideMapping = op.inValueBool("Flip Mapping",false),
    inCaps = op.inValueBool("Caps",true),
    outTrigger = op.outTrigger("next"),
    outGeometry = op.outObject("geometry"),
    geom = new CGL.Geometry("cylinder");

const
    TAU = Math.PI * 2,
    cgl = op.patch.cgl;

var needsRebuild = true;
var mesh = null;
inUVMode.hidePort();

function buildMesh () {

    const flipTex=flipSideMapping.get();

    const
        segments = Math.max(inSegments.get(), 3)|0,
        innerRadius = Math.max(inInnerRadius.get(), 0),
        outerRadius = Math.max(inOuterRadius.get(), innerRadius),
        stacks = Math.max(inStacks.get(), inStacks.defaultValue)|0,
        length = inLength.get(),
        stackLength = length / stacks,
        segmentRadians = TAU / segments,
        uvMode = inUVMode.get()
    ;

    var
        positions = [],
        normals = [],
        tangents = [],
        biTangents = [],
        texcoords = [],
        indices = [],
        x, y, z, i, j,
        a, d, o
    ;

    if (uvMode == "atlas") o = 0.5;
    else o = 1;

    // for each stack
    for (
        i = 0, z = -length/2;
        i <= stacks;
        i++, z += stackLength
    ) {
        // for each segment
        for (
            j = a = 0;
            j <= segments;
            j++, a += segmentRadians
        ) {
            positions.push(
                (x = Math.sin(a)) * outerRadius,
                (y = Math.cos(a)) * outerRadius,
                z
            );
            d = Math.sqrt(x*x+y*y);
            x /= d;
            y /= d;
            normals.push(x,y,0);
            tangents.push(-y,x,0);
            biTangents.push(0,0,1);

            if(flipTex)
                texcoords.push(
                    j / segments,
                    1.0-((z / length + 0.5) * o)
                );

            else
            texcoords.push(
                (z / length + 0.5) * o,
                j / segments
            );
        }
    }

    // create indices
    for (j = 0; j < stacks; j++) {
        for (
            i = 0, d = j * (segments+1);
            i < segments;
            i++, d++
        ) {
            a = d + 1;
            indices.push(
                d + (segments+1), a, d,
                d + (segments+1), a + (segments+1), a
            );
        }
    }

    // create inner shell
    if (innerRadius) {
        d = positions.length;
        for (i = j = 0; i < d; i += 3, j += 2) {
            positions.push(
                (positions[i] / outerRadius) * innerRadius,
                (positions[i+1] / outerRadius) * innerRadius,
                positions[i+2]
            );
            normals.push(
                -normals[i],
                -normals[i+1],
                0
            );
            tangents.push(
                -tangents[i],
                -tangents[i+1],
                0
            );
            biTangents.push(
                0,
                -biTangents[i+1],
                -biTangents[i+2]
            );
            texcoords.push(
                texcoords[j],
                1-texcoords[j+1]
            );
        }
        a = d / 3;
        d = indices.length;
        for (i = 0; i < d; i += 6) {
            indices.push(
                a+indices[i],
                a+indices[i+2],
                a+indices[i+1],
                a+indices[i+3],
                a+indices[i+5],
                a+indices[i+4]
            );
        }

        if(inCaps.get())
        {
            // create caps
            a = positions.length;
            o = a / 2;
            d = segments * 3;

            // cap positions
            Array.prototype.push.apply(positions, positions.slice(0,d));
            Array.prototype.push.apply(positions, positions.slice(o,o+d));
            Array.prototype.push.apply(positions, positions.slice(o-d,o));
            Array.prototype.push.apply(positions, positions.slice(a-d,a));

            // cap normals
            d = segments * 2;
            for (i = 0; i < d; i++) normals.push(0,0,-1), tangents.push(-1,0,0), biTangents.push(0,-1,0);
            for (i = 0; i < d; i++) normals.push(0,0,1), tangents.push(1,0,0), biTangents.push(0,1,0);

            // cap uvs
            if (uvMode == "atlas") {
                d = (innerRadius/outerRadius)*.5;
                for (i = o = 0; i < segments; i++, o += segmentRadians)
                    texcoords.push(
                        Math.sin(o)*.25+.75,
                        Math.cos(o)*.25+.25
                    );
                for (i = o = 0; i < segments; i++, o += segmentRadians)
                    texcoords.push(
                        (Math.sin(o)*d+.5)*.5+.5,
                        (Math.cos(o)*d+.5)*.5
                    );
                for (i = o = 0; i < segments; i++, o += segmentRadians)
                    texcoords.push(
                        Math.sin(o)*.25+.75,
                        Math.cos(o)*.25+.75
                    );
                for (i = o = 0; i < segments; i++, o += segmentRadians)
                    texcoords.push(
                        (Math.sin(o)*d+.5)*.5+.5,
                        (Math.cos(o)*d+.5)*.5+.5
                    );
            } else {
                for (i = 0; i < d; i++) texcoords.push(0,0);
                for (i = 0; i < d; i++) texcoords.push(1,1);
            }

            // cap indices
            for (
                i = 0, o = a / 3 + x;
                i < segments - 1;
                i++, o++
            ) {
                indices.push(
                    o+1,o+segments, o,
                    o+segments+1,o+segments,o+1
                );
            }
            indices.push(
                o+segments,a/3 + x,a/3 + segments + x,
                o+segments,o, a/3 + x
            );
            x += segments * 2;
            for (
                i = 0, o = a / 3 + x;
                i < segments - 1;
                i++, o++
            ) {
                indices.push(
                    o,o+segments,o+1,
                    o+1,o+segments,o+segments+1
                );
            }
            indices.push(
                a/3 + segments + x, a/3 + x, o+segments,
                a/3 + x, o, o+segments
            );
        }

    } else {
        a = positions.length;
        d = a / 3;

        positions.push(0,0,-length/2);
        Array.prototype.push.apply(positions, positions.slice(0,segments*3));
        for (i = 0; i <= segments; i++) normals.push(0,0,-1), tangents.push(-1,0,0), biTangents.push(0,-1,0);


        if(inCaps.get())
        {
            positions.push(0,0,length/2);
            Array.prototype.push.apply(positions, positions.slice(a-segments*3,a));
            for (i = 0; i <= segments; i++) normals.push(0,0,1), tangents.push(1,0,0), biTangents.push(0,1,0);
            if (uvMode == "atlas") {
                texcoords.push(.75,.25);
                for (i = a = 0; i < segments; i++, a += segmentRadians)
                    texcoords.push(Math.sin(a)*.25+.75,Math.cos(a)*.25+.25);
                texcoords.push(.75,.75);
                for (i = a = 0; i < segments; i++, a += segmentRadians)
                    texcoords.push(Math.sin(a)*.25+.75,Math.cos(a)*.25+.75);
            } else {
                for (i = 0; i <= segments; i++) texcoords.push(0,0);
                for (i = 0; i <= segments; i++) texcoords.push(1,1);
            }
            indices.push(d+1, d, d+segments);
            for (i = 1; i < segments; i++)
                indices.push(d, d+i, d+i+1);
            d += segments+1;
            indices.push(d, d+1, d+segments);
            for (i = 1; i < segments; i++)
                indices.push(d, d+i+1, d+i);
            d += segments+1;

        }
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

    needsRebuild=false;
}


// set event handlers
inRender.onTriggered = function () {
    if (needsRebuild) buildMesh();
    if (inDraw.get()) mesh.render(cgl.getShader());
    outTrigger.trigger();
}

inSegments.onChange =
inOuterRadius.onChange =
inInnerRadius.onChange =
inCaps.onChange =
inLength.onChange =
flipSideMapping.onChange=
inStacks.onChange =
inUVMode.onChange = function() {
    // only calculate once, even after multiple settings could were changed
    needsRebuild = true;
};

// set lifecycle handlers
op.onDelete = function () { if(mesh)mesh.dispose(); }

