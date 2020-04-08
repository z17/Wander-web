import React from 'react';
import {createGate, useStore} from 'effector-react'

import './Map.css';

import mapboxgl from 'mapbox-gl';
import {
    mapPositionStore,
    pointsStore,
    setEndPointEvent,
    setRoundPointEvent,
    setStartPointEvent
} from "../../models/Map";

export const MapGate = createGate('gate with props');

const createMark = (lat, lon, className, map) => {
    let mark = new mapboxgl.LngLat(lon, lat);
    let el = document.createElement('div');
    el.className = className;
    return new mapboxgl.Marker(el)
        .setLngLat(mark)
        .addTo(map);
};

export const createPointMark = (lat, lon, map) => {
    return createMark(lat, lon, 'App-map_marker_point', map)
};

export const createStartMark = (lat, lon, map) => {
    return createMark(lat, lon, 'App-map_marker_start', map)
};

export const createEndMark = (lat, lon, map) => {
    return createMark(lat, lon, 'App-map_marker_end', map)
};

export const createRoundMark = (lat, lon, map) => {
    return createMark(lat, lon, 'App-map_marker_round', map)
};

export const createRouteLine = (map, route_map_id, coordinates) => {
    map.addSource(route_map_id, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': coordinates
            }
        }
    });
    map.addLayer({
        'id': route_map_id,
        'type': 'line',
        'source': route_map_id,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#33317e',
            'line-width': 2
        }
    });
};

export const createMap = (lon, lat, zoom) => {
    return new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [lon, lat],
        zoom
    });
};

const Map = () => {
    const position = useStore(mapPositionStore);
    const points = useStore(pointsStore);

    return (
        <React.Fragment>
            <MapGate {...position}/>
            <div className="App-map__wrapper">
                <div className="App-map__sidebar">
                    <div>Longitude: {position.lon} | Latitude: {position.lat} | Zoom: {position.zoom}</div>
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
