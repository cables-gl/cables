let inGeom = op.inObject("geometry");

let inSort = op.inValueSelect("Sort", ["None", "Z"], "None");

let outMin = op.outValue("Min Value");
let outMax = op.outValue("Max Value");

let outGeom = op.outObject("Result");
let outValues = op.outArray("Values");

let faceGroups = [];

inSort.onChange = analyze;
inGeom.onChange = analyze;

function analyze()
{
    let startInit = CABLES.now();
    let sort = inSort.get();

    let geom = inGeom.get();
    if (!geom) return;

    let verts = geom.vertices;
    let faces = geom.verticesIndices;
    let i = 0;

    function changeVertIndex(from, to)
    {
        for (let i = 0; i < faces.length; i++)
        {
            if (faces[i] == from)
            {
                faces[i] = to;
            }
        }
    }

    // find dupes
    for (i = 0; i < verts.length / 3; i++)
    {
        for (let j = 0; j < verts.length / 3; j++)
        {
            if (i != j)
            {
                if (verts[i * 3 + 0] == verts[j * 3 + 0] && verts[i * 3 + 1] == verts[j * 3 + 1] && verts[i * 3 + 2] == verts[j * 3 + 2])
                {
                    changeVertIndex(j, i);
                }
            }
        }
    }

    let groupCounter = 0;
    faceGroups.length = faces.length / 3;

    let faceGroupPosCount = [];
    let faceGroupPos = [];
    faceGroupPos.length = faces.length / 3;
    faceGroupPosCount.length = faces.length / 3;

    for (i = 0; i < faceGroups.length; i++)
    {
        faceGroups[i] = -1;
    }

    function setFaceGroupByVertIndex(idx, group)
    {
        let i = 0;
        for (i = 0; i < faces.length / 3; i++)
        {
            if (faceGroups[i] != group)
            {
                if (faces[i * 3 + 0] == idx || faces[i * 3 + 1] == idx || faces[i * 3 + 2] == idx)
                {
                    faceGroups[i] = group;

                    faceGroupPos[group] = faceGroupPos[group] || 0;
                    faceGroupPosCount[group] = faceGroupPosCount[group] || 0;

                    if (sort == "Z")
                    {
                        faceGroupPos[group] += (
                            verts[faces[i * 3 + 0] * 3 + 2] +
                            verts[faces[i * 3 + 1] * 3 + 2] +
                            verts[faces[i * 3 + 2] * 3 + 2]
                        ) / 3;
                        faceGroupPosCount[group]++;
                    }

                    if (faces[i * 3 + 0] != idx) setFaceGroupByVertIndex(faces[i * 3 + 0], group);
                    if (faces[i * 3 + 1] != idx) setFaceGroupByVertIndex(faces[i * 3 + 1], group);
                    if (faces[i * 3 + 2] != idx) setFaceGroupByVertIndex(faces[i * 3 + 2], group);
                }
            }
        }
    }

    for (i = 0; i < faces.length / 3; i++)
    {
        if (faceGroups[i] == -1)
        {
            setFaceGroupByVertIndex(faces[i * 3 + 0], groupCounter);
            setFaceGroupByVertIndex(faces[i * 3 + 1], groupCounter);
            setFaceGroupByVertIndex(faces[i * 3 + 2], groupCounter);
            groupCounter++;
        }
    }

    let arrSubmesh = [];
    arrSubmesh.length = verts.length / 3;
    groupCounter -= 1;

    let maxGroupValue = -999999;
    let minGroupValue = 999999;

    if (sort == "Z")
    {
        for (i = 0; i < faceGroups.length; i++)
        {
            var group = faceGroups[i];
            if (group != null && faceGroupPosCount[group] != 0)
                faceGroupPos[group] = (faceGroupPosCount[group] - faceGroupPos[group]) / faceGroupPosCount[group];
            faceGroupPosCount[group] = 0;
        }
    }

    for (i = 0; i < faceGroups.length; i++)
    {
        var group = faceGroups[i];// / groupCounter;

        if (sort == "Z") group = faceGroupPos[group];

        maxGroupValue = Math.max(maxGroupValue, group);
        minGroupValue = Math.min(minGroupValue, group);

        arrSubmesh[faces[i * 3 + 0]] = group;
        arrSubmesh[faces[i * 3 + 1]] = group;
        arrSubmesh[faces[i * 3 + 2]] = group;
    }

    geom.setAttribute("attrSubmesh", arrSubmesh, 1);
    outValues.set(null);
    outValues.set(arrSubmesh);

    outGeom.set(null);
    outGeom.set(geom);
    outMax.set(maxGroupValue);
    outMin.set(minGroupValue);
}
