
var inGeom=op.inObject("geometry");

var inSort=op.inValueSelect("Sort",["None","Z"],"None");

var outMin=op.outValue("Min Value");
var outMax=op.outValue("Max Value");

var outGeom=op.outObject("Result");
var outValues=op.outArray("Values");

var faceGroups=[];

inSort.onChange=analyze;
inGeom.onChange=analyze;

function analyze()
{
    var startInit=CABLES.now();
    // console.log("start submesh analyze...");
    var sort=inSort.get();

    var geom=inGeom.get();
    if(!geom)return;

    var verts=geom.vertices;
    var faces=geom.verticesIndices;
    var i=0;

    function changeVertIndex(from,to)
    {
        for(var i=0;i<faces.length;i++)
        {
            if(faces[i]==from)
            {
                faces[i]=to;
            }
        }
    }

    // find dupes
    for(i=0;i<verts.length/3;i++)
    {
        for(var j=0;j<verts.length/3;j++)
        {
            if(i!=j)
            {
                if(verts[i*3+0]==verts[j*3+0] && verts[i*3+1]==verts[j*3+1] && verts[i*3+2]==verts[j*3+2] )
                {
                    changeVertIndex(j,i);
                }
            }
        }
    }

    var groupCounter=0;
    faceGroups.length=faces.length/3;

    var faceGroupPosCount=[];
    var faceGroupPos=[];
    faceGroupPos.length=faces.length/3;
    faceGroupPosCount.length=faces.length/3;

    for(i=0;i<faceGroups.length;i++)
    {
        faceGroups[i]=-1;
    }

    function setFaceGroupByVertIndex(idx,group)
    {
        var i=0;
        for(i=0;i<faces.length/3;i++)
        {
            if(faceGroups[i]!=group)
            {
                if(faces[i*3+0]==idx || faces[i*3+1]==idx || faces[i*3+2]==idx )
                {
                    faceGroups[i]=group;

                    faceGroupPos[group]=faceGroupPos[group]||0;
                    faceGroupPosCount[group]=faceGroupPosCount[group]||0;

                    if(sort=="Z")
                    {
                        faceGroupPos[group]+=(
                            verts[faces[i*3+0]*3+2]+
                            verts[faces[i*3+1]*3+2]+
                            verts[faces[i*3+2]*3+2]
                            )/3;
                        faceGroupPosCount[group]++;
                    }

                    if( faces[i*3+0]!=idx ) setFaceGroupByVertIndex( faces[i*3+0], group);
                    if( faces[i*3+1]!=idx ) setFaceGroupByVertIndex( faces[i*3+1], group);
                    if( faces[i*3+2]!=idx ) setFaceGroupByVertIndex( faces[i*3+2], group);
                }
            }
        }
    }

    for(i=0;i<faces.length/3;i++)
    {
        if( faceGroups[i] == -1 )
        {
            setFaceGroupByVertIndex( faces[i*3+0], groupCounter);
            setFaceGroupByVertIndex( faces[i*3+1], groupCounter);
            setFaceGroupByVertIndex( faces[i*3+2], groupCounter);
            groupCounter++;
        }
    }

    var arrSubmesh=[];
    arrSubmesh.length=verts.length/3;
    groupCounter-=1;
    
    var maxGroupValue=-999999;
    var minGroupValue=999999;


    if(sort=="Z")
    {
        for(i=0;i<faceGroups.length;i++)
        {
            var group = faceGroups[i];
            if(group!=null && faceGroupPosCount[group]!=0)
                faceGroupPos[group] = (faceGroupPosCount[group]-faceGroupPos[group]) / faceGroupPosCount[group];
            faceGroupPosCount[group]=0;
        }
    }

    for(i=0;i<faceGroups.length;i++)
    {
        var group=faceGroups[i];// / groupCounter;

        if(sort=="Z") group=faceGroupPos[group];
        
        maxGroupValue=Math.max(maxGroupValue,group);
        minGroupValue=Math.min(minGroupValue,group);

        arrSubmesh[faces[i*3+0]]=group;
        arrSubmesh[faces[i*3+1]]=group;
        arrSubmesh[faces[i*3+2]]=group;
    }

    // console.log(arrSubmesh);
    geom.setAttribute("attrSubmesh",arrSubmesh,1);

    // console.log('groups',groupCounter);
    // console.log('faces',faces.length/3);

    outValues.set(null);
    outValues.set(arrSubmesh);

    outGeom.set(null);
    outGeom.set(geom);
    // console.log(geom.getAttributes());
    outMax.set(maxGroupValue);
    outMin.set(minGroupValue);
    

    // console.log("finished submesh analyze...",(CABLES.now()-startInit));


};








