import slots_frag from "./slots.frag";
import slots_vert from "./slots.vert";
import slots_head_frag from "./slots_head.frag";
import slots_head_vert from "./slots_head.vert";


class RenderTargets
{
    constructor(cgl)
    {
        this._numBuffers = 4;
        this.asString = "";
        this._name = "rendertargets";
        this.mod = new CGL.ShaderModifier(cgl, this._name);
        this.mod.addModule(
            {
                "priority": 2,
                "title": this._name,
                "name": "MODULE_COLOR",
                "srcHeadFrag": slots_head_frag,
                "srcBodyFrag": slots_frag,
            });

        this.mod.addModule(
            {
                "priority": 2,
                "title": this._name,
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": slots_head_vert,
                "srcBodyVert": slots_vert
            });
    }

    getTypes()
    {
        return ["Default",
            "Material Id",
            "Position World",
            "Position Local",
            "Position Object",
            "Normal",
            "Normal * ModelView",
            "FragCoord.z",
            "TexCoord",
            "Black",
            "Alpha 0",
            "0", "1"];
    }

    setNumBuffers(n)
    {
        this._numBuffers = n;
    }

    update(slots)
    {
        this.asString = "";
        let hasPosWorld = false;
        let hasPosLocal = false;
        let hasPosObject = false;
        let hasNormalModelView = false;

        for (let i = 0; i < this._numBuffers; i++)
        {
            this.mod.toggleDefine("SLOT_TEX_" + i + "_NORMAL", slots[i] == "Normal");
            this.mod.toggleDefine("SLOT_TEX_" + i + "_COLOR", slots[i] == "Color" || slots[i] == "Default");
            this.mod.toggleDefine("SLOT_TEX_" + i + "_BLACK", slots[i] == "Black");
            this.mod.toggleDefine("SLOT_TEX_" + i + "_1", slots[i] == "1");
            this.mod.toggleDefine("SLOT_TEX_" + i + "_0", slots[i] == "0");
            this.mod.toggleDefine("SLOT_TEX_" + i + "_ALPHA0", slots[i] == "Alpha 0");

            hasPosWorld = (slots[i] == "Position World") || hasPosWorld;
            hasNormalModelView = (slots[i] == "Normal * ModelView") || hasNormalModelView;
            hasPosLocal = (slots[i] == "Position Local") || hasPosLocal;
            hasPosObject = (slots[i] == "Position Object") || hasPosObject;

            this.mod.toggleDefine("SLOT_TEX_" + i + "_POS_WORLD", slots[i] == "Position World");
            this.mod.toggleDefine("SLOT_TEX_" + i + "_POS_LOCAL", slots[i] == "Position Local");
            this.mod.toggleDefine("SLOT_TEX_" + i + "_POS_OBJECT", slots[i] == "Position Object");
            this.mod.toggleDefine("SLOT_TEX_" + i + "_TEXCOORD", slots[i] == "TexCoord");
            this.mod.toggleDefine("SLOT_TEX_" + i + "_MATERIALID", slots[i] == "Material Id");

            this.mod.toggleDefine("SLOT_TEX_" + i + "_NORMAL_MV", slots[i] == "Normal * ModelView");
            this.mod.toggleDefine("SLOT_TEX_" + i + "_FRAGZ", slots[i] == "FragCoord.z");

            this.asString += slots[i];
            if (i != this._numBuffers - 1) this.asString += " | ";
        }

        this.mod.toggleDefine("SLOT_POS_WORLD", hasPosWorld);
        this.mod.toggleDefine("SLOT_POS_LOCAL", hasPosLocal);
        this.mod.toggleDefine("SLOT_POS_OBJECT", hasPosObject);
        this.mod.toggleDefine("SLOT_POS_NORMAL_MV", hasNormalModelView);
    }
}

export { RenderTargets };
