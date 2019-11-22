import React from 'react';
import './Header.css';

import {Menu} from '../Menu';

const Header = () => (
    <header className="App-header">
        <img src="https://via.placeholder.com/75" alt="Placeholder logo"/>
        <Menu/>
    </header>
);

export default Header;
