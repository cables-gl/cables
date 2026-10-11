const RapierTools = {
    "GROUP_COUNT": 16,
    "ALL_GROUPS": 0xffff,

    parseGroupMask(str)
    {
        if (!str || !str.trim()) return RapierTools.ALL_GROUPS;

        let mask = 0;
        const parts = str.split(",");
        for (let i = 0; i < parts.length; i++)
        {
            const range = parts[i].split("-");
            const from = parseInt(range[0]);
            const to = range.length > 1 ? parseInt(range[1]) : from;
            for (let g = from; g <= to; g++)
                if (g >= 1 && g <= RapierTools.GROUP_COUNT) mask |= 1 << (g - 1);
        }
        return mask;
    },

    getCollisionGroups(group, collidesWith)
    {
        const membership = (group >= 1 && group <= RapierTools.GROUP_COUNT) ? 1 << (group - 1) : 0;
        return ((membership << 16) | RapierTools.parseGroupMask(collidesWith)) >>> 0;
    },

    collidesWithNothing(collisionGroups)
    {
        return (collisionGroups & RapierTools.ALL_GROUPS) == 0;
    },

    getQueryGroups(str)
    {
        if (!str || !str.trim()) return undefined;
        return ((RapierTools.ALL_GROUPS << 16) | RapierTools.parseGroupMask(str)) >>> 0;
    }
};
