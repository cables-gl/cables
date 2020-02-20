const render=op.inTrigger('render');
const geometry=op.inObject("geometry");
const dropdown = op.inSwitch("Vectors", ["Normals", "Tangents", "Bitangents"], "Normals");
const mul=op.inValueFloat("Length", 0.1);
const inColorize = op.inBool("Colorize", true);
const inR = op.inFloat("R", 0);
const inG = op.inFloat("G", 0.8);
const inB = op.inFloat("B", 0);
const inA = op.inFloatSlider("A", 1);
inR.setUiAttribs({ colorPick: true, greyout: true });
inG.setUiAttribs({ greyout: true });
inB.setUiAttribs({ greyout: true });
inA.setUiAttribs({ greyout: true });

const trigger=op.outTrigger('trigger');
geometry.ignoreValueSerialize=true;

const handleColorizeChange = function() {
    inR.setUiAttribs({ greyout: !inColorize.get() });
    inG.setUiAttribs({ greyout: !inColorize.get() });
    inB.setUiAttribs({ greyout: !inColorize.get() });
    inA.setUiAttribs({ greyout: !inColorize.get() });

    if (inColorize.get()) {
        shader.setSource(shader.getDefaultVertexShader(), attachments.colorize_normals_frag);
    } else {
        shader.setSource(shader.getDefaultVertexShader(), shader.getDefaultFragmentShader());
    }
}
const cgl=op.patch.cgl;
const shader = new CGL.Shader(cgl, "colorizeNormals");
shader.setSource(shader.getDefaultVertexShader(), attachments.colorize_normals_frag);
shader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
shader.glPrimitive=cgl.gl.LINES;

const inColorUniform = new CGL.Uniform(shader, "4f", "inColor", inR, inG, inB, inA);

geometry.onChange = mul.onChange = dropdown.onChange = buildMesh;
inColorize.onChange = handleColorizeChange;
handleColorizeChange();

let geom = null;
let mesh = null;

buildMesh();

function buildMesh() {
    if (!geom) geom = new CGL.Geometry("shownormals");
    geom.clear();

    const points = [];
    const tc = [];
    const geometryInput = geometry.get();

    if(geometryInput && geometryInput.vertices) {
        op.setUiError("noVertices", null);
        for(let i = 0; i < geometryInput.vertices.length; i += 3) {

            points.push(geometryInput.vertices[i+0]);
            points.push(geometryInput.vertices[i+1]);
            points.push(geometryInput.vertices[i+2]);

            tc.push(0,1);
            tc.push(0,1);
            if (dropdown.get() === "Normals") {
                if (!geometryInput.vertexNormals || !geometryInput.vertexNormals.length) {
                    op.setUiError("noNormals", "Input geometry has no normals!", 1);
                } else {
                    op.setUiError("noNormals", null);
                    points.push(geometryInput.vertices[i+0]+geometryInput.vertexNormals[i+0]*mul.get());
                    points.push(geometryInput.vertices[i+1]+geometryInput.vertexNormals[i+1]*mul.get());
                    points.push(geometryInput.vertices[i+2]+geometryInput.vertexNormals[i+2]*mul.get());
                }
            }

            if(dropdown.get() === "Tangents") {
                if (!geometryInput.tangents || !geometryInput.tangents.length) {
                    op.setUiError("noTangents", "Input geometry has no tangents!", 1);
                } else {
                    op.setUiError("noTangents", null);
                    points.push(geometryInput.vertices[i+0]+geometryInput.tangents[i+0]*mul.get());
                    points.push(geometryInput.vertices[i+1]+geometryInput.tangents[i+1]*mul.get());
                    points.push(geometryInput.vertices[i+2]+geometryInput.tangents[i+2]*mul.get());
                }
            }
            if(dropdown.get() === "Bitangents") {
                if (!geometryInput.biTangents || !geometryInput.biTangents.length) {
                    op.setUiError("noBitangents", "Input geometry has no bitangents!", 1);
                } else {
                    op.setUiError("noBitangents", null);
                    points.push(geometryInput.vertices[i+0]+geometryInput.biTangents[i+0]*mul.get());
                    points.push(geometryInput.vertices[i+1]+geometryInput.biTangents[i+1]*mul.get());
                    points.push(geometryInput.vertices[i+2]+geometryInput.biTangents[i+2]*mul.get());
                }
            }
        }

        geom.vertices = points;

        if (mesh) mesh.dispose();
        mesh = new CGL.Mesh(cgl,geom);
    } else {
        op.setUiError("noVertices", "There is no input geometry or input geometry has no vertices!", 0);
        return;
    }
}

render.onTriggered=function() {
    if(geometry.get()) {
        if(!shader)return;
        if(mesh) mesh.render(shader);
    }

    trigger.trigger();
};

