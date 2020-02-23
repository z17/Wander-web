import React from 'react';
import './Sidebar.css';

class Sidebar extends React.Component {

  render() {
    return <aside className="App-sidebar">
      <div className="App-sidebar__container">
        <div className="App-sidebar__title-block">
          <h1 className="App-sidebar__title">Wander</h1>
        </div>
        <div className="App-sidebar__route_block">
          <p className="App-sidebar__route_title">
            New route
          </p>
          <input className="App-sidebar__route_block_input" type="text" name="from" placeholder="From"/>
          <input className="App-sidebar__route_block_input" type="text" name="to" placeholder="To"/>
          <input className="App-sidebar__route_block_build" type="button" name="build" value="Build route"/>
        </div>
        <div className="App-sidebar__footer-block">
          Download on Google Play
        </div>
      </div>
    </aside>
  }
}

export default Sidebar;