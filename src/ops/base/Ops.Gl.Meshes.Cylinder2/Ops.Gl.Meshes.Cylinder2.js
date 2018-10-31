const
    TAU = Math.PI * 2,
    cgl = op.patch.cgl,
    inRender = op.inFunction("render"),
    inSegments = op.inValue("segments", 40),
    inStacks = op.inValue("stacks", 1),
    inLength = op.inValue("length", 1),
    inOuterRadius = op.inValue("outer radius", 0.5),
    inInnerRadius = op.inValue("inner radius", 0),
    inUVMode = op.inValueSelect("UV mode", ["simple","atlas"],"simple"),
    inDraw = op.inValueBool("Draw",true),
    outTrigger = op.outFunction("next"),
    outGeometry = op.outObject("geometry"),
    geom = new CGL.Geometry("cylinder")
;
var needsRebuild = true;
var mesh = null;
inUVMode.hidePort();

function buildMesh () {

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
            normals.push(
                x / d,
                y / d,
                0
            );
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
                d, a, d + (segments+1),
                a, a + (segments+1), d + (segments+1)
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
        for (i = 0; i < d; i++) normals.push(0,0,-1);
        for (i = 0; i < d; i++) normals.push(0,0,1);

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
            j = x = 0;
            j < 2;
            j++, x += segments * 2
        ) {
            for (
                i = 0, o = a / 3 + x;
                i < segments - 1;
                i++, o++
            ) {
                indices.push(
                    o+1, o+segments, o,
                    o+segments+1,o+segments,o+1
                );
            }
            indices.push(
                o+segments, a/3 + x, a/3 + segments + x,
                o, o+segments, a/3 + x
            );
        }
    } else {
        a = positions.length;
        d = a / 3;

        positions.push(0,0,-length/2);
        Array.prototype.push.apply(positions, positions.slice(0,segments*3));
        for (i = 0; i <= segments; i++) normals.push(0,0,-1);

        positions.push(0,0,length/2);
        Array.prototype.push.apply(positions, positions.slice(a-segments*3,a));
        for (i = 0; i <= segments; i++) normals.push(0,0,1);

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
        for (j = 0; j < 2; j++) {
            indices.push(d, d+1, d+segments);
            for (i = 1; i < segments; i++)
                indices.push(d, d+i, d+i+1);
            d += segments+1;
        }
    }

    // set geometry
    geom.clear();
    geom.vertices=positions;
    geom.texCoords=texcoords;
    geom.vertexNormals=normals;
    geom.verticesIndices=indices;

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
inLength.onChange =
inStacks.onChange =
inUVMode.onChange = function() {
    // only calculate once, even after multiple settings could were changed
    needsRebuild = true;
};

// set lifecycle handlers
op.onDelete = function () { mesh.dispose(); }

