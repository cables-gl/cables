# Export to github (pages)

Select the "GITHUB" option in the export dialog:

![Button](../img/export_github.png)

## Prerequisites

- An account on [github](https://github.com/)
- Any repository, create one [here](https://github.com/new) if needed (add at least one file, otherwise the repo doesn't exist for github).
- An [access token](https://github.com/settings/tokens) for your github-user with at least "repo" permissions.
  - If you use github's "fine grained permissions", make sure your token has "read and write" permission to the "contents" of your created repo.
- (if needed) Activate [github pages](https://pages.github.com/) for your repository in the repositories settings on github.
  - Your repository needs to be made public for this to be free.
  - You need to pick a branch when activating pages, remember this for the settings below.    
    
## Parameters

All these parameters can only be changed/entered by the owner of the patch. Exports can be done to configured deployments
by all collaborators added to the patch.

### Repository Owner

Put in the name of the repository owner, most of the time this is your github username. 

If your repository URL is `https://github.com/cables-gl/cables-cli/` your ownername will be `cables-gl`

### Repository Name

Put in the name of the repository, if your repository URL is `https://github.com/cables-gl/cables-cli/` 
the name of the repository will be `cables-cli`

### Branch

This can be left blank, set to `master` for older repositories or pick any branch you want the changes to be pushed to.

### Subdirectory

If you want your patches to reside in a subdirectory of your repository, put the name of that directory here.
This is a good way to have multiple patches in the same repository but in different directories (`patch1/`, `patch2/`, ...)

### Access Token

Enter your generated [access token](https://github.com/settings/tokens) that has at least "repo" permissions in github.

## Video Tutorial
<iframe width="384" height="216" src="https://www.youtube.com/embed/1TwP5DQoef4" title="Github Pages Export - Byte Size" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## WALKTHROUGH
- Enter the above information
- Click on button
- Wait for the two buttons to appear
- Click on "View Deployment" to visit your website on github
- Click on "Deploments overview" to see your repository on github

## CAVEATS
- This will not work if there are any merge conflicts, so do not change any cables files from outside cables
- This will overwrite any patch that has been exported to the same repo/subdir-combination before
- Use git commit history to roll-back any mishaps

## Export Options

You can choose how the contents of your export should look. The defaults should be fine for almost everything.

### Include assets

If your patch uses uploaded files (textures, audio, data, ...), choose one of the following options to have
these files included in the export.

**Use "All" if you are generating filenames on the fly (iterators, arrays, ...) to make sure all files are available in the Export**

- Automatic: Tries to guess which files are used in the patch and includes only used assets.
- All: Includes all the assets uploaded to the patch or referenced in there (safe option).
- None: No assets included in the export with smaller download size but some things might not work in the export.

### Package

- Single Javascript File: Packages and minifies everything into one single javascript file to include.
- Multiple Files: Keeps the patch configuration, your code, and core code in separate files.

### Export without subdirectories

- Should you need the directory structure of your patch to be "flat" (no js/ or assets/ subdirectory) you can select this option.
  - This will usually not be needed. Some platforms do not allow for accessing subdirectories though, and some setups of frameworks like react/vue also behave weirdly with subdirectories.

### Minify Code

- Deselecting this option will make your code bigger, but more readable. While this might be useful in debugging situations, you usually don't want this in "production" (i.e. your finished code).

### Add Source Maps

- When minifying code, this option will add [source maps](https://developer.chrome.com/blog/sourcemaps) to your javascript files.
  This will make the code readable in dev-tools and may help in debugging situations, but it will have an additional download for
  users opening the dev-tools of their browser.

## Minify GLSL

- Minify shadercode. Same as "Minify Code", but for GLSL-Shadercode.
