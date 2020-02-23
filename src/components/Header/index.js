import React from 'react';
import './Header.css';

import Menu from '../Menu';

import logo from '../../assets/images/app-logo.svg';

class Header extends React.Component {
  render() {
    return <header className="App-header">
      <img src={logo} alt="Wander logo"/>
      <Menu/>
    </header>
  }
}

export default Header;
