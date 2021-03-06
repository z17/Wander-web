import React from 'react';
import {useStore, useGate} from 'effector-react'

import './Map.css';
import {
    setPoint
} from "../../models/map";
import {$points} from "../../models/points/state";
import {MapGate} from '../../models/map';
import {$mapSettings} from "../../models/map/state";

export const Map = () => {
    const mapSettings = useStore($mapSettings);
    const points = useStore($points);
    useGate(MapGate, mapSettings);
    return (
        <div className="App-map__wrapper">
            <div className="App-map__sidebar">
                <div>Longitude: {mapSettings.lon} | Latitude: {mapSettings.lat} | Zoom: {mapSettings.zoom}</div>
            </div>
            {points.selected && <div className="App-map__menu">
                <button onClick={() => setPoint('start')} className="App-map__menu_button">From</button>
                <button onClick={() => setPoint('end')} className="App-map__menu_button">To</button>
                <button onClick={() => setPoint('round')} className="App-map__menu_button">Round</button>
            </div>}
            <div id="map" className="App-map__container"/>
        </div>
    )
};
