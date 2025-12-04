const
    exec = op.inTrigger("Trigger"),
    inScale = op.inFloat("Scale"),
    inPositions = op.inArray("Positions", null, 3),
    inGeo = op.inObject("Geometry", null, "threeGeometry"),
    next = op.outTrigger("Next");

const threeOp = new CABLES.ThreeOp(op);

let mesh = null;
let geometry = null;

inGeo.onLinkChanged =
inGeo.onChange = updateGeom;

function updateGeom()
{
    geometry = inGeo.get();
}

function updateMats()
{
    const arr = inPositions.get();

        	const matrix = new THREE.Matrix4();
    console.log("pos");
    for (let i = 0; i < arr.length / 3; i++)
    {
    	matrix.setPosition(arr[i * 3 + 0], arr[i * 3 + 1], arr[i * 3 + 2]);
        mesh.setMatrixAt(i, matrix);
        mesh.setColorAt(i, new THREE.Color(0x330000));
        // console.log("mat", matrix);
    }
        						mesh.instanceColor.needsUpdate = true;
        						mesh.instanceMatrix.needsUpdate = true;
    mesh.needsUpdate = true;
    mesh.computeBoundingSphere();
}

exec.onTriggered = () =>
{
    const arr = inPositions.get();

    if (!arr)
    {
        return;
    }

    if (!mesh)
    {
        updateGeom();

        mesh = new THREE.InstancedMesh(geometry || threeOp.renderer.defaultGeometry, arr.length / 3);
        mesh.frustumCulled = false;

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // mesh.frustumCulled=false;
        updateMats();
        threeOp.setSceneObject(mesh);
        // 			mesh.setColorAt( i, color );
    }
    if (mesh.geometry != geometry)
    {
        mesh.geometry = geometry || threeOp.renderer.defaultGeometry;

        updateMats();
    }

    // mesh.position.set(inPosX.get(), 0, 0);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = inScale.get();

    threeOp.push();

    next.trigger();

    threeOp.pop();
};
