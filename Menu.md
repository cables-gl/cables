*How to structure the menu? Which items are needed?*  

## new stuff:
- «New Project»-button cannot be clicked. / is not a button. show projectname somewhere else
- upload button/dropzone ???


## Menu Structure

- *Items in `()` brackets might not be needed.*  
- ***Admin-only** – only be visible to admins*
- ***Context-sensitive*** – only appears under certain cirumstances*      
- *`-` is a separator between the menu items*  
- Menu items with a shortcut should display the shortcut next to the name, also the app should check which OS the user is on and display the right shortcut, e.g. `⌘ + s` on Mac next to `Save`

### Cables 

- [Settings](#settings)

### Patch

- [New](#new-project)
- -
- [Open](#open-project)
- ([Open Recent](#open-recent-project))
- [Open From Local Storage](#open-project-from-local-storage) **Admin-only**
- -
- [Browse Examples](#examples) ![open-in-new-window-icom](http://i.stack.imgur.com/IadAX.png)
- [Browse Own Patches](#examples) ![open-in-new-window-icom](http://i.stack.imgur.com/IadAX.png)
- [Browse Community Patches](#examples) ![open-in-new-window-icom](http://i.stack.imgur.com/IadAX.png)
- -
- [Save](#save-project)  
- [Save As](#save-project-as)  
- [Save To Local Storage](#save-project-to-local-storage)  **Admin-only**
- -
- [Search](#search-project)
- -
- [Settings](#project-settings)

## Other Menus

### Profile

*Revelaed by clicking on the Gravatar-icon / username*  

- Profile
- Settings
- Logout

### Edit

- [Undo](#undo)
- [Redo](#redo) **Context-sensitive**

### Op / Operator

- [New](#new-op)
- [Clone](#clone-op) **Context-sensitive**

### Help

- [About](#about)
- [Reference](#reference)

## Menu Items

### New Project

- Creates a new blank project (Should check for changes in current document)  

### Open Project

- Opens a project from the user’s projects  

### Open Recent Project

- Shows the last x projects the user edited

### Open Project From Local Storage

### Examples

- Example projects which show how to use webGL, web-audio, API-interaction, …

### Save Project

### Save Project As

- Saves the project under a different name (all project data probably needs to be copied here)

### Save Project To Local Storage

### Search Project

- Search for an operator in the visual view
- Highlight the hits visually?

### Project Settings 

- Opens a popup-window, settings: `visibility [public, private, hidden]`

### Cables Settings

- Universal settings
- Editor settings
- Color schemes
- Editor Animations [on, off]

### Undo

### Redo

- Only possible after an undo

### New Op

- Creates a new operator with basic input / output code (minimal logic), directly asks the user to enter the op’s name

### Clone Op

- Makes a copy of the selected op and asks for the name, stores a reference to the old op, so we later now it’s a fork

### About

- What is *cables*? What is it about? Who created it?

### Reference

- Links to the online reference where all nodes are explained – e.g. [readthedocs](https://readthedocs.org/)
