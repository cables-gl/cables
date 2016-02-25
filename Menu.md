*How to structure the menu? Which items are needed?*  

## Menu Items

- *Items in `()` brackets might not be needed.*  
- *Items in `[]` brackets should only be visible to admins*
- *Items in `{}` are context sensitive and only appear under certain cirumstances*      
- *`-` is a separator between the menu items*  
- Menu items with a shortcut should display the shortcut next to the name, also the app should check which OS the user is on and display the right shortcut, e.g. `⌘ + s` on Mac next to `Save`

### Project

- `New` – Creates a new blank project (Should check for changes in current document)  
- -
- `Open` – Opens a project from the user’s projects  
- (`Open Recent` – Shows the last x projects  
- [`Open From Local Storage`]  
- -
- `Save`  
- `Save As` – Saves the project under a different name (all project data probably needs to be copied here)  
- [`Save To Local Storage`]  
- -
- `Settings` – opens a popup-window, settings: `visibility [public, private, hidden]`

### Op / Operator

- `New` – creates a new operator with basic input / output code (minimal logic), directly asks the user to enter the op’s name
- {`Clone`} – makes a copy of the selected op and asks for the name, stores a reference to the old op, so we later now it’s a fork

### Help

- `About` – What is *cables*? What is it about? Who created it?
- `Reference` – Links to the online reference where all nodes are explained – e.g. [readthedocs](https://readthedocs.org/)

