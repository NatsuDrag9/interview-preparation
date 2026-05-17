## Modal

Design a modal/dialog component that shows content in a window overlaying the page.

### Requirements

- What components do you want in the modal:
  - X button?
  - Title?
  - Footer - cta buttons like cancel/apply?
  - Anything else?

- What customizations should be provided?
  - Modal style
  - Anything else?
- Type of content to be displayed in the modal?
- What devices should the modal be displayed in?
- Any non-functional requirements - like transitions for UX, mobile design?

### Assumptions:

To keep things simple, this architecture ignores _anything else_ in the above requirements.

Content type - totally user dependent as I will make the modal accept DOM elements as props

### Architecture

- Trigger source that open the modal
  - A trigger element / user action
  - Background action - for eg, event based scenario

As the trigger source is unknown, it is important to decouple trigger source and the modal functionality. For this:

- Accept an `isOpen` prop that displays the modal
- A callback that closes the modal by updating `isOpen` prop

UI:

- Have a container component which renders the Modal
- Modal component:
  - A background element which overlays the container component and on which the modal content is rendered
  - Content strucutre:
    - title, X at the top
    - custom children
    - footer (apply + cancel) at the bottom

UX

- Smooth opening and closing transitions (optional)
- Smooth button click transition effects

### State Management

**Container Component**

- Stores the `isPopupOpen, setIsPopupOpen` state
- `isPopupOpen` is updated by the trigger source here
- Any state pertaining to customizable content

**Modal Component**

- No local state for basic funcitonlaity

### Data Flow

- Container component ---> Modal (pre-defined callbacks + children react nodes)
- Modal ---> Container component (callback parameters if defined passed via callback calls)

### Interfaces and API design

**Container Component**

- Does not accept any prop
- Contains the callback definitions

**Modal Component**

```
interface ModalStyle {
    title?: Record<string, string>;
    outerContainer: Record<string, string>;
    innerContainer: Record<string, string>;
    footer?: Record<string, string>;
    cancelBtn?: Record<string, string>;
    applyBtn?: Record<string, string>;
    xBtn?: Record<string, string>;
}

interface ModalProps {
    onPopupClose: () => void;
    onApply: () => void;
    children: ReactNode;
    modalStyles?: ModalStyle;
    isPopupOpen: boolean;
}
```

### Component Architecture

**Container Component**

```
const [isOpen, setIsOpen] = useState(false);

handlePopupClose () {
    // Callback assigned to onPopupClose and called when either Cancel OR X is clicked
}

handleApply() {
    // Callback assigned to onApply
}

<div>
    {isOpen && (<Modal children={<p>Hi!</p>} is} onApply={handleApply} onPopupClose={handlePopupClose} modalStyle={{title: {fontSize:"24px"}}} />)}
</div>

```

**Modal Component**

```


// Called by xBtn and cancelBtn
handleCancelClick = () => {
    // Perform operation
    onPopupClose();
}

handleApplyClick = () => {
    // Perform operation
    onApplyClick();
}

handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if(event.target === event.currentTarget) {
        // Close popup
        onPopupClose();
    }
}

// ESC click handle

useEffect(() => {
    // Prevent background scrolling
    if (!isPopupOpen) return;

  const originalOverflow = document.body.style.overflow;

  document.body.style.overflow = "hidden";


// ESC key functionality
    const handleKeyDown = (event: KeyboardEvent) => {
        if(event.key === "Escape") {
            event.preventDefault();
        handleClosePopup();
        }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;
    }
}, [handleClosePopup])

<div className="model-outer-container" role="dialog" onClick={handleClickOutside} styles={modalStyles.outerContainer}>

<div className="modal-inner-container" styles={modalStyles.innerContainer}>
<h5 className="modal__title" styles={modalStyles.title}>
<button className="modal__close-btn" styles={modalStyles.xBtn} onClick={handleCancel}>
<div className="modal__children">
{children}
</div>

<div className="footer" styles={modalStyles.footer}>
{/* Render cancel and apply button using HTML button element. Apply modalStyles.cancelBtn and modalStyles.applyBtn in-line*/}
</div>
</div>
</div>
```

```
// For overlay, apply following styles to modal-outer-container:
position: fixed;
inset: 0;
z-index:99;
width: 100vw;
height: 100vh;
background-color: rgba(255 255 255 / 0.9); // Edit
backdrop-filter: blur(20px); // Edit

// Fix the height of modal-inner-container
height: 60vh;

// Fix the height of modal__children to add scrolling behaviour
height: 70%;
overflow: scroll;
scroll-behaviour: smooth;
scrollbar-width: thin;
```

### Performance

### Accessibility

- Parent container within Modal element should have aria-role="dialog"
- Use HTML `button` element for X
- Keyboard triggers and navigation
  - ESC closes the modal
  - Return / Enter key triggers Apply button callback
  - tabIndex
- Modal when displayed should be in-focus

### UX

- Fade-in and fade-out animations
- Fade-out:
  - Update Modal component to store a local state `isClosing, setIsClosing`
  - Define a `handleModalClose()` which

```

const FADE_OUT_TIME = 300; // in ms
handleModalCloseWithAnimation() {
setIsClosing(true);
setTimer(() => {
onPopupClose();
}, FADE_OUT_TIME);
}

```

- Update className of parent element in Modal with `modal-outer-container ${isClosing ? "modal-outer-container--fade-out" : ""}`
- In stylesheet, add a fade-out animation with delay = 0.3s, ease-in using keyframes: 0% = opacity: 1; 100% = opacity: 0;
- When user presses ESC close, clicks X / Apply / Cancel, the appropriate callback in Modal is called

- Fade-in: Update the parent's style with fade-in animation having 0.3s delay, ease-out using keyframes: 0% = opacity: 0; 100% = opacity: 1;
- For best UX, animation delay of both animations === FADE_OUT_DELAY constant
- For mobile, I'd use media queries to display the modal-inner-container at almost full screen size (OR 90% of vw, vh).
