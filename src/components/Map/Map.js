import React from 'react';
import './Map.css';

import mapboxgl from 'mapbox-gl';

class Map extends React.Component {
    state = {
        lon: 30.3154,
        lat: 59.9402,
        zoom: 12
    };


    componentDidMount() {
        const map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/light-v10',
            center: [this.state.lon, this.state.lat],
            zoom: this.state.zoom
        });

        map.on('move', () => {
            this.setState({
                lon: map.getCenter().lng.toFixed(4),
                lat: map.getCenter().lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            });
        });
    }

    render() {
        return (
            <div className="App-map__wrapper">
                <div className="App-map__sidebar">
                    <div>Longitude: {this.state.lon} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
                </div>
                <div ref={el => this.mapContainer = el} className="App-map__container"/>
            </div>
        )
    }
}

export default Map;
