import React from 'react';
import './App.css';

import {Header} from './components/Header';
import {Sidebar} from './components/Sidebar';
import {Map} from './components/Map';

function App() {
    return (
        <div className="App">
            <Header/>
            <div className="App-layout">
                <Sidebar/>
                <Map/>
            </div>
        </div>
    );
}

export default App;
