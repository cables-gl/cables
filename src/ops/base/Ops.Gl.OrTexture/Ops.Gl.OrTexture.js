const
    str0 = op.inTexture("Texture 1"),
    str1 = op.inTexture("Texture 2"),
    str2 = op.inTexture("Texture 3"),
    str3 = op.inTexture("Texture 4"),
    str4 = op.inTexture("Texture 5"),
    str5 = op.inTexture("Texture 6"),
    str6 = op.inTexture("Texture 7"),
    str7 = op.inTexture("Texture 8"),
    result = op.outTexture("Result");

str0.onChange =
    str1.onChange =
    str2.onChange =
    str3.onChange =
    str4.onChange =
    str5.onChange =
    str6.onChange =
    str7.onChange = exec;

const emptyTex = CGL.Texture.getEmptyTexture(op.patch.cgl);
const defaultTex = CGL.Texture.getTempTexture(op.patch.cgl);

function exec()
{
    if (str0.get() && str0.get() != emptyTex && str0.get() != defaultTex) result.set(str0.get());
    else if (str1.get() && str1.get() != emptyTex && str1.get() != defaultTex) result.set(str1.get());
    else if (str2.get() && str2.get() != emptyTex && str2.get() != defaultTex) result.set(str2.get());
    else if (str3.get() && str3.get() != emptyTex && str3.get() != defaultTex) result.set(str3.get());
    else if (str4.get() && str4.get() != emptyTex && str4.get() != defaultTex) result.set(str4.get());
    else if (str5.get() && str5.get() != emptyTex && str5.get() != defaultTex) result.set(str5.get());
    else if (str6.get() && str6.get() != emptyTex && str6.get() != defaultTex) result.set(str6.get());
    else if (str7.get() && str7.get() != emptyTex && str7.get() != defaultTex) result.set(str7.get());
    else result.set(emptyTex);
}
