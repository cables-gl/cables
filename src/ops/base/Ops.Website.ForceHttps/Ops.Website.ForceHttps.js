if (!op.patch.isEditorMode() && !location.href.startsWith("http://localhost"))
{
    if (location.protocol !== "https:") location.protocol = "https:";
}
