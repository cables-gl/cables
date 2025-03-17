import slots_frag from "./slots.frag";
import slots_vert from "./slots.vert";
import slots_head_frag from "./slots_head.frag";
import slots_head_vert from "./slots_head.vert";

export class RenderTargets
{
    constructor(cgl)
    {
        this._numBuffers = 4;
        this.asString = "";
        this._slots = ["Default", "Normal"];
        this._name = "rendertargets" + CABLES.uuid();
        this.mod = new CGL.ShaderModifier(cgl, this._name);

        this.mod.onBind = (currentShader) =>
        {
            // console.log(currentShader);
            // currentShader.setDrawBuffers([true, true, true, true]);
        };
    }

    updateModules()
    {
        this.mod.removeModule(this._name + "_frag");

        this.mod.addModule(
            {
                "priority": 2,
                "title": this._name + "_frag",
                "name": "MODULE_COLOR",
                "srcHeadFrag": slots_head_frag,
                "srcBodyFrag": this.getSrcFrag(),
            });

        this.mod.removeModule(this._name + "_vert");

        this.mod.addModule(
            {
                "priority": 2,
                "title": this._name + "_vert",
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": slots_head_vert,
                "srcBodyVert": slots_vert
            });
    }

    getTypes()
    {
        return ["Default",
            "Material Id, Object Id, Instance Id",
            "Material Id",
            "Object Id",
            "Position World",
            "Position * ModelView",
            "Position Local",
            "Position Object",
            "Normal",
            "Normal World",
            "Normal * ModelView",
            "OIT Accum",
            "OIT Revealage",
            "FragCoord.z",
            "TexCoord",
            "Black",
            "0", "1"];
    }

    setNumBuffers(n)
    {
        this._numBuffers = n;
    }

    getSrcString(type, i)
    {
        let outcolor = "outColor";
        if (i === "")outcolor = "col";

        if (type == "Normal") return "    " + outcolor + i + " = vec4(norm,1.);".endl();
        else if (type == "Material Id, Object Id, Instance Id") return "    " + outcolor + i + " = vec4(round(materialId),round(objectId),round(instIdx),1.0);".endl();
        else if (type == "Default" || type == "Color") return "    " + outcolor + i + " = col;".endl();
        else if (type == "1") return "    " + outcolor + i + " = vec4(1.,1.,1.,1.);".endl();
        else if (type == "0") return "    " + outcolor + i + " = vec4(0.,0.,0.,0.);".endl();
        else if (type == "Black") return "    " + outcolor + i + " = vec4(0.,0.,0.,1.);".endl();
        else if (type == "TexCoord") return "    " + outcolor + i + " = vec4(texCoord,0.,1.);".endl();
        else if (type == "Position Local") return "    " + outcolor + i + " = vec4(MOD_pos_local,1.);".endl();
        else if (type == "Position World") return "    " + outcolor + i + " = vec4(MOD_pos_world,1.);".endl();
        else if (type == "Position * ModelView") return "    " + outcolor + i + " = vec4(MOD_pos_mv,1.);".endl();

        else if (type == "Position Object") return "    " + outcolor + i + " = vec4(MOD_pos_object,1.);".endl();
        else if (type == "Normal World") return "    " + outcolor + i + " = vec4(MOD_normal_world,1.);".endl();
        else if (type == "Normal * ModelView") return "    " + outcolor + i + " = vec4(MOD_normal_mv,1.);".endl();
        else if (type == "Material Id") return "    " + outcolor + i + " = vec4(round(materialId),round(instIdx),0.,1.);".endl();
        else if (type == "Object Id") return "    " + outcolor + i + " = vec4(objectId,0.,0.,1.);".endl();
        else if (type == "FragCoord.z") return "    " + outcolor + i + " = vec4(vec3(gl_FragCoord.z),1.);".endl();

        else if (type.includes("OIT "))
        {
            let str = ""
                .endl() + "#ifndef OIT_WEIGHT"
                .endl() + "#define OIT_WEIGHT"
                .endl() + "    float oitWeight=clamp(pow(min(1.0, col.a * 10.0) + 0.01, 3.0) * 1e8 * pow(1.0 - gl_FragCoord.z * 0.9, 3.0), 1e-2, 3e3);"
                // .endl() + "    float oitWeight=100.0*exp(gl_FragCoord.z*gl_FragCoord.z);"
                .endl() + "#endif"
                .endl();

            if (type == "OIT Revealage") str += "    " + outcolor + i + " = vec4(col.a*oitWeight,col.a,1.0,1.0);".endl();
            if (type == "OIT Accum") str += ""
                .endl() + "    " + outcolor + i + " = vec4(col.rgb * col.a * oitWeight, col.a);";

            return str;
        }
    }

    getSrcFrag()
    {
        let src = slots_frag;

        if (this._slots.length == 1)
        {
            src += this.getSrcString(this._slots[0], "");
        }
        else
            for (let i = 0; i < this._numBuffers; i++)
                src += this.getSrcString(this._slots[i], i);

        return src;
    }

    update(slots)
    {
        this._slots = slots;
        this._numBuffers = slots.length;
        this.asString = "";

        let hasPosWorld = false;
        let hasPosLocal = false;
        let hasPosObject = false;
        let hasMaterialId = false;
        let hasObjectId = false;
        let hasNormalModelView = false;
        let hasNormalWorld = false;
        let hasPosModelView = false;

        for (let i = 0; i < this._numBuffers; i++)
        {
            hasPosWorld = (slots[i] == "Position World") || hasPosWorld;
            hasNormalModelView = (slots[i] == "Normal * ModelView") || hasNormalModelView;
            hasPosLocal = (slots[i] == "Position Local") || hasPosLocal;
            hasPosModelView = (slots[i] == "Position * ModelView") || hasPosModelView;
            hasPosObject = (slots[i] == "Position Object") || hasPosObject;
            hasMaterialId = (slots[i].includes("Material Id")) || hasMaterialId;
            hasObjectId = (slots[i].includes("Object Id")) || hasObjectId;
            hasNormalWorld = (slots[i].includes("Normal World")) || hasNormalWorld;

            this.asString += slots[i];
            if (i != this._numBuffers - 1) this.asString += " | ";
        }

        this.updateModules();

        this.mod.toggleDefine("MOD_UNI_OBJECT_ID", hasObjectId);
        this.mod.toggleDefine("MOD_UNI_MATERIAL_ID", hasMaterialId);
        this.mod.toggleDefine("MOD_SLOT_POS_MV", hasPosModelView);

        this.mod.toggleDefine("MOD_SLOT_POS_WORLD", hasPosWorld);
        this.mod.toggleDefine("MOD_SLOT_POS_LOCAL", hasPosLocal);
        this.mod.toggleDefine("MOD_SLOT_POS_OBJECT", hasPosObject);
        this.mod.toggleDefine("MOD_SLOT_POS_NORMAL_MV", hasNormalModelView);
        this.mod.toggleDefine("MOD_SLOT_POS_NORMAL_WORLD", hasNormalWorld);
    }
}
