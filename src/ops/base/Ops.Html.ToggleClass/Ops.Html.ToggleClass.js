const
    inEle=op.inObject("HTML Element"),
    inClassName=op.inString("Classname"),
    inActive=op.inValueBool("Active",true);

inActive.onChange=
    inClassName.onChange=
    inEle.onChange=update;

op.onDelete=remove;

var oldEle=null;
var oldName=null;

function remove(ele)
{
    if(ele && ele.classList) ele.classList.remove(oldName);
}

function update()
{
    var ele=inEle.get();
    var cn=inClassName.get();

    if(!inEle.isLinked()) remove(oldEle);

    if(!cn || !ele || !ele.classList)return;
    if(oldEle && ele!=oldEle)oldEle.classList.remove(cn);
    remove(ele);

    if(!inActive.get()) ele.classList.remove(cn);
    else ele.classList.add(cn);

    oldName=cn;
    oldEle=ele;
}