## Dropdown Menu

Design a dropdown menu component that can reveal a menu containing a list of actions.

## Requirements

1. What type of content is to be dsiplayed as a menu item - image, text, image+text, anything else?
2. How many (sub-)menus exist?
3. What action should be performed when user clicks a menu item apart from displaying it in the selected-option-display?
4. Is there a maximum number of items to adasdbe displayed in the menu?
5. Any customizations to be provided like CSS?
6. What type of devices will the component be used on?

### Assumptions:

1. The menu items only displays text content
2. A menu item doesn't open a sub-menu
3. No maximum limit of items to be displayed in the menu
4. Since this is a simple dropdown, I would rely on native button semantics instead of implementing a full ARIA listbox, to avoid incomplete accessibility behavior

### Architecture

#### UI:

*  **Containter Component**:
* Renders the `<DropdownMenu>` component with its menu options
* Can make api calls to fetch the dropdown menu options
* Stores parent related state
*  **Dropdown Component**:
* An element to display the label of the dropdown
* An element to display the selected option
* An element that contains the list of menu items
* An elmeent to display each list item
* A toggle button - a downward pointing chevron arrow. Since this is a standalone component, we can use svg and img tag. In a codebase with an existing design system and icon library, import the chevron arrow from that icons library
* Displays the initial value

#### UX:

* Smooth opening/closing transition of the menu-items container
* Rotation transition for the chevron button
* Appropriate accessibility for the selected option element, menu item and menu-items container
* Smooth scroll behaviour
* Hover state effects
* Handle data not available state
* Keyboard event listeners
* Outside click closes dropdown
* Keyboard search highlights the option which is typed (optional)

### State Management

#### Container Component

* ` selectedOption, setSelectedOption`: Holds the selected option
* ` menuItems, setMenuItems`: Holds the list of items to be displayed in the dropdown obtained from an api call. Not required if menuItems are accessible in a locally stored array
* 

#### DropdownMenu Component

* ` isOpen, setIsOpen`: Holds whether the dropdown is open or not

### Data Flow

* Container component ---> DropdownMenu (menuItems)
* DropdownMenu ---> Container component (selectedOption via a callback)

### Interface and API Design

#### Container Component

* No props interface as it doesn't accept any prop
* Contains callback definitions

#### DropdownMenu

```
export interface DropddownMenuItem {
    value: string | number;
    displayName: string;
}
```

```
export interface DropdownMenuProps {
    label?: string;
    selectedOption?: DropdownMenuItem;
    onOptionSelect: (value: DropdownMenuItem) => void;
    menuItems: DropdownMenuItems[];
}
```

### Component Architecture

#### Container Component

#### DropdownMenu

* Use the `DropdownMenuItem` interface
* Create an element to display selected option
* Create an element to display dropdown-menu options
* Clicking an option calls `handleOptionClick` which in turn calls the `onOptionSelect` with the selected value
* If `!menuItems.length`, display no data avaialable in the selected-option element. Add style `cursor: not-allowed; opacity: 0.7` to `dropdown-menu.no-data` element
* Create `handleOutsideClick` handler which sets `isOpen` to false and is called when user clicks anywhere outside the dropdown-menu element
* Rotate the chevron element when clicked using `isOpen` to define a conditional class
* ` dropdown-menu__menu-items`is positioned absolutely relative to the parent container `dropdown-menu` and has `scroll-behaviour: smooth`
* For smooth UX transitions:
  * Define `max-height:` for dropdown-menu__menu-items
  * Hide dropdown-menu__menu-items when `isOpen` is false using `visibility: hidden`. Set transition on max-height, opacity and translateY (optional, use if required to improve ux based on experimental evidence)
  * Set `visibility: show` when `isOpen` is true with `max-height: <appropriate-value>` and `translateY`.
  * Set hover effect on each `dropdown-menu__menu-item` using pseudo selector `&:hover`

```
const DEFAULT_SELECTED_OPTION = {
    value: "default-value",
    displayName: "Select an option"
};

function DropdownMenu({onOptionSelect, menuItems, label, initialValue, selectedOption}: DropdownMenuProps) {
      const dropdownRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

     const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
         setIsOpen(false);
    }
  };


  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);


  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  }

  const selectOption = (option: DropdownMenuItem) => {
    onOptionSelect(option);
    setIsOpen(false);
  }

    if(!menuItems.length) {
        return (
             <div className="dropdown-menu no-data">
        {/* Display the label if label is passed */}
           {label && <label className="dropdown-menu__label">{label} </label>}

           <div className="dropdown-menu__container">
            <p className="dropdown-menu__selected-option>"No Data Available</p>

            <div className="dropdown-menu__menu-items">
            {menuItems.map((item) => (
                <button className="dropdpown-menu__menu-item"> {item.displayName} </button>
            ))}
            </div>
           </div>
        </div>
        )
    }

    return (
        <div className="dropdown-menu">
        {/* Display the label if label is passed */}
           {label && <label className="dropdown-menu__label" aria-label={label}>{label} </label>}

           <div className="dropdown-menu__container">
            <button className="dropdown-menu__selected-option-container    onKeyDown={(e) => {
          if (e.key === 'Enter') {
            toggleDropdown();
          }
        }}>
            <p className="dropdown-menu__selected-option>{selectedOption ?? "Select an option"}</p>
            <img src={ChevronArrowDown} className={`arrow ${isOpen ? "open" : ""`}`} alt="chevron-arrow">
            </button>

            <div className={`dropdown-menu__menu-items ${isOpen ? "visible" : ""}`} tabIndex={0} aria-expanded={isOpen} aria-controls="dropdown-options" ref={dropdownRef}>
            {menuItems.map((item) => (
                <button className="dropdpown-menu__menu-item"
                aria-selected={selectedOption.value === item.value}
            onClick={() => selectOption(option)}
            onKeyDown={(e) => {
          if (e.key === 'Enter') {
            selectOption(option)
          }
             > {item.displayName} </button>
            ))}
            </div>
           </div>
        </div>
    );

}

```

### Performance

* Wrap `onOptionSelect` in container component within `useCallback` with approriate deps
* If the number of items to be displayed is very large (in thousands) then virtualization can be used
* Instead of hiding the `dropdonw-menu__menu-items`, render it only when `isOpen` is true. While this improves performance but it may affect UX and smooth transitions - a trade-off has to be made.

### Accessibilty

* Aria properites for `dropdown-menu__menu-items`: `tabIndex={0}`, `aria-expanded={isOpen}`, `aria-controls="dropdown-options` \`
* Aria properites for `dropdown-menu__menu-item`: `, `tabIndex={0}\`,
* 

### UX

* Keyboard event listeners
* Outside click closes dropdown
* Search using key press (optional and outside this scope for now)
* Transition effects
* Clicking option closes teh dropdown