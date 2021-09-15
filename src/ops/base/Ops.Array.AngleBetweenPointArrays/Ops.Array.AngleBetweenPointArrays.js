const
    inArray_0 = op.inArray("Array Origin"),
	inArray_1 = op.inArray("Array Point"),
	outArray_0 = op.outArray("Array Angles"),
	outArray_1 = op.outArray("1D length r"),
	outNumber = op.outNumber("Length Array r");

let showingError = false;

function update()
{
    let
        array0 = inArray_0.get(),
        array1 = inArray_1.get(),
        mathArray = [],
        angleArray = [],
        rArray = [],
        arrayLength=0;

    if(!array0 || !array1)
    {
        outNumber.set(0);
        outArray_0.set(null);
        outArray_1.set(null);
        return;
    }

    if(array0.length !== array1.length)
    {
        if(!showingError)
        {
            op.uiAttr({error:"Arrays do not have the same length !"});
            showingError = true;
        }
        return;
    }
    if(showingError)
    {
        showingError = false;
        op.uiAttr({error:null});
    }

    var i = 0;

    for(i = 0; i < array0.length; i++)
	{
		mathArray[i] = array1[i] - array0[i];
	}

	var
	 	j = 0,
		k = 0;

	for(j = 0; j < mathArray.length; j+=3)
	{
		const
			x = mathArray[j+0],
			y = mathArray[j+1],
			z = mathArray[j+2],
			r = Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2)),
			theta = Math.acos(y/r)*(180/Math.PI),
			phi = Math.atan2(x,z)*(180/Math.PI);

		angleArray[j+0]=theta;
    	angleArray[j+1]=phi;
   		angleArray[j+2]=0;

   		rArray[k]=r;
   		k++;
   	}
   	outArray_0.set(null);
   	outArray_1.set(null);
   	outArray_0.set(angleArray);
   	outArray_1.set(rArray);
   	outNumber.set(rArray.length);
}

inArray_0.onChange = inArray_1.onChange = function ()
{
    update();
}

update();