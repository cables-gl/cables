const
    exec = op.inTrigger("Trigger"),
    inScaleGeo = op.inFloat("Scale Geom", 1),
    inPositions = op.inArray("Positions", null, 3),
    inScale = op.inArray("Scalings", null, 3),
    inColors = op.inArray("Colors", null, 3),
    inGeo = op.inObject("Geometry", null, "threeGeometry"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);

let mesh = null;
let geometry = null;
let currentMaterial = null;

inGeo.onLinkChanged =
inGeo.onChange = updateGeom;

function updateGeom()
{
    geometry = inGeo.get();
}

inScaleGeo.onChange =
inScale.onChange =
inPositions.onChange = () =>
{
    updateMats();
};

function updateMats()
{
    if (!mesh) return;
    const arr = inPositions.get() || [];
    const arrScale = inScale.get() || [];
    const matrix = new THREE.Matrix4();

    for (let i = 0; i < arr.length / 3; i++)
    {
    	if (arrScale) matrix.makeScale(arrScale[i * 3 + 0] * inScaleGeo.get(), arrScale[i * 3 + 1] * inScaleGeo.get(), arrScale[i * 3 + 2] * inScaleGeo.get());
    	else matrix.makeScale(inScaleGeo.get(), inScaleGeo.get(), inScaleGeo.get());

    	matrix.setPosition(arr[i * 3 + 0], arr[i * 3 + 1], arr[i * 3 + 2]);

        mesh.setMatrixAt(i, matrix);
        mesh.setColorAt(i, new THREE.Color(1, 0, 0));
    }

    mesh.instanceColor.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.needsUpdate = true;
    mesh.computeBoundingSphere();
}

exec.onTriggered = () =>
{
    const arr = inPositions.get();

    if (!arr || !geometry) return;

    if (!mesh || currentMaterial != threeOp.renderer.currentMaterial)
    {
        if (mesh)mesh.remove();
        updateGeom();

        mesh = new THREE.InstancedMesh(geometry || threeOp.renderer.defaultGeometry, threeOp.renderer.currentMaterial, arr.length / 3);
        mesh.frustumCulled = false;
        currentMaterial = threeOp.renderer.currentMaterial;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        updateMats();
        threeOp.setSceneObject(mesh);
    }
    if (mesh.geometry != geometry)
    {
        mesh.geometry = geometry || threeOp.renderer.defaultGeometry;
        updateMats();
    }

    threeOp.push();
    next.trigger();
    threeOp.pop();
};
