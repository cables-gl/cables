const inArray = op.inArray("Array in");
const count = op.inValueInt("Rotate amount",0);
const outArray = op.outArray("ArrayOut");

var newArr=[];
outArray.set(newArr);

count.onChange =
inArray.onChange = function()
{
    var arr=inArray.get();
    if(!arr)return;

    var rotateIndex = count.get();

    newArr = rotate(inArray.get(),rotateIndex,0);
    outArray.set(null);
    outArray.set(newArr);
}

//https://gist.github.com/aubergene/7ecfe624199e68f60258
function rotate(array, n, guard)
{
	var head, tail;
        n = (n === null) || guard ? 1 : n;
        n = n % array.length;
        tail = array.slice(n);
	head = array.slice(0, n);
	return tail.concat(head);
}
