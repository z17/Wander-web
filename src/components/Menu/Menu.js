import React from 'react';
import './Menu.css'

const Menu = () => (
    <nav className="App-menu-wrapper">
        <ul className="App-menu">
            <li><a className="App-menu-item active" href="#">Map</a></li>
            <li><a className="App-menu-item" href="#">Lists</a></li>
            <li><a className="App-menu-item" href="#">About</a></li>
            <li><a className="App-menu-item" href="#">Help</a></li>
            <li><a className="App-menu-item" href="#">Sign up</a></li>
            <li><a className="App-menu-item" href="#">Login</a></li>
        </ul>
    </nav>
);

export default Menu;
