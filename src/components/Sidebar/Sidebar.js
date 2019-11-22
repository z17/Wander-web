import React from 'react';
import './Sidebar.css';

const Sidebar = () => (
    <aside className="App-sidebar">
        <div className="App-sidebar__container">
            <div className="App-sidebar__title-block">
                <h1 className="App-sidebar__title">Wander</h1>
                <p className="App-sidebar__lead">
                    From wetlands to canals and dams Amsterdam is alive
                </p>
            </div>
            <div className="App-sidebar__form-block">
                Form
            </div>
            <div className="App-sidebar__footer-block">
                Footer
            </div>
        </div>
    </aside>
);

export default Sidebar;
