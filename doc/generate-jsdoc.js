const fs = require("fs-extra");
const fsOrg = require("fs");
const documentation = require("documentation");
const replace = require("replace-in-file");

const { html } = documentation.formats;
const streamArray = require("stream-array");
const vfs = require("vinyl-fs");

function capitalizeFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const fileNames = [
    "../src/core/core_op.js",
    "../src/core/core_port.js",
    "../src/core/core_patch.js",
    "../src/core/core_link.js",
    "../src/core/cgl_state.js",
    "../src/core/cgl_texture.js",
    "../src/core/cgl_geom.js",
    "../src/core/cgl_mesh.js",
    "../src/core/cgl_shader.js",
    "../src/core/cgl_shader_uniform.js",
    "../src/core/anim.js",
    "../src/core/timer.js",
    "../src/core/cgl_framebuffer.js",
    "../src/core/0_utils.js",
];

console.log("Creating documentation for ", fileNames);

const names = [];
const promises = fileNames.map(async (fileName, index) =>
{
    try
    {
        const comments = await documentation.build([fileName], { shallow: false });
        if (comments[0])
        {
            const name = comments[0].namespace.toLowerCase();
            names.push(name);
            const htmlOutput = await html(comments, { theme: "theme" });
            return new Promise((resolve, reject) =>
            {
                streamArray(htmlOutput)
                    .pipe(vfs.dest(`./temp/${name}`))
                    .on("finish", () =>
                    {
                        resolve();
                    })
                    .on("error", err => reject(err));
            });
        }
    }
    catch (err)
    {
        throw err;
    }
});

Promise.all(promises).then(() =>
{
    Promise.all(
        names.map(async (name) =>
        {
            try
            {
                // await fs.copyFile(
                //   `${__dirname}/temp/${name}/index.html`,
                //   `${__dirname}/output/${name}.html`,
                // );
                await fs.rename(`${__dirname}/temp/${name}/index.html`, `${__dirname}/temp/${name}/${name}.html`);
            }
            catch (err)
            {
                console.error("ERROR:", err);
            }
        }),
    )
        .then(() =>
        {
            const htmlFiles = names.map(name => `${__dirname}/temp/${name}/${name}.html`);
            const capitalNames = names.map(capitalizeFirstLetter);
            const anchorEls = capitalNames.map(
                capitalName =>
                    `: <a href="../api_${capitalName.toLowerCase()}/${capitalName.toUpperCase()}.html">${capitalName}</a>`,
            );
            const regExps = capitalNames.map(name => new RegExp(`: ${name}`, "g"));

            const replacePromises = capitalNames.map(async () =>
            {
                try
                {
                    await replace({
                        files: htmlFiles,
                        from: regExps,
                        to: anchorEls,
                    });
                }
                catch (err)
                {
                    console.error("ERR IN REPLACE", err);
                }
            });

            Promise.all(replacePromises).then(async () =>
            {
                console.log("Created documentation. Creating .html & .md files.");
                const mdPromises = htmlFiles.map(async (htmlFile) =>
                {
                    try
                    {
                        const htmlName = htmlFile.split("/").pop();
                        const folderName = htmlName.split(".").shift();

                        await fsOrg.mkdir(`${__dirname}/api_${folderName}/`, () => {});
                        await fs.copyFile(htmlFile, `${__dirname}/api_${folderName}/${htmlName}`);

                        await fsOrg.writeFile(
                            `${__dirname}/api_${folderName}/${folderName.toUpperCase()}.md`,
                            `!INCLUDE "${htmlName}"\n`,
                            () => {},
                        );
                    }
                    catch (err)
                    {
                        console.error("ERR MD GEN", err);
                    }
                });
                await Promise.all(mdPromises);
                console.log("Writing .md done.");
                fs.removeSync(`${__dirname}/temp/`);
                console.log("Deleting /output folder.");
            });
        })
        .catch(err => console.error(err));
});
