var update=op.inFunction("Update");
var elId=op.inValueString("Html Id");
var persp=op.inValue("Perspective");
var next=op.outFunction("Next");

function generateCSSString(matrix ){
   var str = '';
   str += matrix[0].toFixed(20) + ',';
   str += matrix[1].toFixed(20) + ',';
   str += matrix[2].toFixed(20) + ',';
   str += matrix[3].toFixed(20) + ',';
   str += matrix[4].toFixed(20) + ',';
   str += matrix[5].toFixed(20) + ',';
   str += matrix[6].toFixed(20) + ',';
   str += matrix[7].toFixed(20) + ',';
   str += matrix[8].toFixed(20) + ',';
   str += matrix[9].toFixed(20) + ',';
   str += matrix[10].toFixed(20) + ',';
   str += matrix[11].toFixed(20) + ',';
   str += matrix[12].toFixed(20) + ',';
   str += matrix[13].toFixed(20) + ',';
   str += matrix[14].toFixed(20) + ',';
   str += matrix[15].toFixed(20);

   return 'matrix3d(' + str + ')';

}

var ele=null;

update.onTriggered=function()
{
    if(!ele)
    {
        ele=document.getElementById(elId.get());
    }
    
    if(ele)
    {
        ele.style.transform= generateCSSString(op.patch.cgl.modelMatrix());
        ele.style.perspective=persp.get()+'px';
        ele.style['-webkit-perspective']=persp.get()+'px';
        ele.style['perspective-origin']='50% 50%';
     
    }
    
    
};