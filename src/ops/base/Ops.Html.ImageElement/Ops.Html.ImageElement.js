const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif"]),
    outImage = op.outObject("Image Element", null, "element");

let element = op.patch.getDocument().createElement("img");
op.onDelete = removeEle;

filename.onChange = () =>
{
    element.setAttribute("src", filename.get());
    element.setAttribute("crossOrigin", "anonymous");
    outImage.setRef(element);
};

function removeEle()
{
    if (element)element.remove();
    element = null;
    outImage.set(element);
}
