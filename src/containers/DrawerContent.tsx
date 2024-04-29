import React from 'react';

const DrawerContent: React.FC = () => {
    return (
        <div className="drawer-content">
            <h1>React Bottom Drawers</h1>
            <hr />
            <h3>Friendly dialogs made simple</h3>
            <p>
                This is a basic example of how to use this package. Just import the <i>Drawer</i> component, and place
                your content as its children.
            </p>

            <p>
                Note that you have to control the component visibility, providing an <strong>isVisible</strong> boolean
                prop and an <strong>onClose</strong> callback.
            </p>
            <p>
                If your content is too tall (like this example), it will be scrollable. In that case{' '}
                <b>scrollbars should be visible</b>, but you can hide them with the <b>hideScrollbars</b> prop.
            </p>
            <h3>How do I close it?</h3>
            <div className="how-to-close">
                <div>
                    Pressing
                    <span className="esc-key">ESC</span>
                </div>

                <div>Slide down from the handle</div>
                <div>Click outside the Drawer</div>
            </div>
        </div>
    );
};

export default DrawerContent;
