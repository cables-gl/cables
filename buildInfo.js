const getRepoInfo = require("git-repo-info");

module.exports = (options, loaderContext) =>
{
    const git = getRepoInfo();
    const date = new Date();
    const buildInfo = {
        "timestamp": date.getTime(),
        "created": date.toISOString(),
        "git": {
            "branch": git.branch,
            "commit": git.sha,
            "date": git.committerDate,
        }
    };
    return {
        "cacheable": true,
        "code": "module.exports = " + JSON.stringify(buildInfo) + ";",
    };
};
