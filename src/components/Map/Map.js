import React from 'react';
import {createGate, useStore} from 'effector-react'

import './Map.css';


import {
    setEndPointEvent,
    setRoundPointEvent,
    setStartPointEvent
} from "../../models/map/index.js";
import {$points} from "../../models/points/state";
import {$mapSettings} from "../../models/map/state";

export const MapGate = createGate('gate with props');


const Map = () => {
    const mapSettings = useStore($mapSettings);
    const points = useStore($points);

    return (
        <React.Fragment>
            <MapGate {...mapSettings}/>
            <div className="App-map__wrapper">
                <div className="App-map__sidebar">
                    <div>Longitude: {mapSettings.lon} | Latitude: {mapSettings.lat} | Zoom: {mapSettings.zoom}</div>
                </div>
                {points.selected && <div className="App-map__menu">
                    <button onClick={setStartPointEvent} className="App-map__menu_button">From</button>
                    <button onClick={setEndPointEvent} className="App-map__menu_button">To</button>
                    <button onClick={setRoundPointEvent} className="App-map__menu_button">Round</button>
                </div>}
                <div id="map" className="App-map__container"/>
            </div>
        </React.Fragment>
    )
};

export default Map;
