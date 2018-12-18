const exe=op.inTrigger("Exe");
const inArr1=op.inArray('Array 1');
const inArr2=op.inArray('Array 2');
const inPerc=op.inValueSlider("perc");
const next=op.outTrigger("Next");
const outArr=op.outArray("Result");

var result=mat4.create();

function ip(val1,val2,perc)
{
    return ( (val2-val1)*perc+val1 );
}

var a=vec3.create();
var b=vec3.create();

exe.onTriggered=function()
{
    var arr1=inArr1.get();
    var arr2=inArr2.get();

    if(!arr1 || !arr2 || arr1.length!=arr2.length)
    {
        outArr.set(null);
        console.log("arrays wrong");
    }
    else
    {
        getYPR(a,arr1);
        getYPR(b,arr2);

        var perc=inPerc.get();

        mat4.identity(result);
        result[12]=ip(arr1[12],arr2[12],perc);
        result[13]=ip(arr1[13],arr2[13],perc);
        result[14]=ip(arr1[14],arr2[14],perc);

        vec3.lerp(a,a,b,perc);

        mat4.rotateZ(result,result,a[2]);
        mat4.rotateY(result,result,a[1]);
        mat4.rotateX(result,result,a[0]);
        
        outArr.set(null);
        outArr.set(result);
    }
    next.trigger();
};

// 0  1  2  3
// 4  5  6  7
// 8  9  10 11
// 12 13 14 15

function getYPR(v,m)
{
    var r1=Math.atan2(m[6],m[10]);
    var c2=Math.sqrt(m[0]*m[0] + m[1]*m[1]);
    var r2=Math.atan2(-m[2],c2);
    var s1=Math.sin(r1);
    var c1=Math.cos(r1);
    var r3=Math.atan2(s1*m[8] - c1*m[4], c1*m[5] - s1*m[9]);

    v[0]=r1;
    v[1]=r2;
    v[2]=r3;
    return v;
}