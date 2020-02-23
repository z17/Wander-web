import React from 'react';
import './Map.css';

import mapboxgl from 'mapbox-gl';

class Map extends React.Component {
    state = {
        lat: 59.9402,
        lon: 30.3154,
        zoom: 12
    };

    map = {};

    objects = [];
    pathPoints = [];

    start = null;
    end = null;

    setMarker = (lat, lon) => {
        return this.createMark(lat, lon, 'App-map_marker_point');
    };

    setPathMarker = (lat, lon) => {
        return this.createMark(lat, lon, 'App-map_marker_path');
    };

    setStartMark = (lat, lon) => {
        if (this.start) {
            this.start.remove();
        }
        this.start = this.createMark(lat, lon, 'App-map_marker_start');
        this.start.getElement().addEventListener('click', (event) => {
            this.start.remove();
            this.start = null;
            event.stopPropagation();
        });
    };

    setEndMark = (lat, lon) => {
        if (this.end) {
            this.end.remove();
        }
        this.end = this.createMark(lat, lon, 'App-map_marker_end');
        this.end.getElement().addEventListener('click', (event) => {
            this.end.remove();
            this.end = null;
            event.stopPropagation();
        });

        if (this.end && this.start) {
            this.buildRoute();
        }
    };

    buildRoute = () => {

        fetch('http://127.0.0.1:1323/api/routes/get', {
            method: 'POST',
            body: JSON.stringify({
                points: [
                    {
                        lat: this.start.getLngLat().lat,
                        lon: this.start.getLngLat().lng,
                    },
                    {
                        lat: this.end.getLngLat().lat,
                        lon: this.end.getLngLat().lng,
                    }

                ],
                type: 'direct'
            })
        })
          .then(result => result.json())
          .then(result => {
              console.log(result);

              let pathPoints = [];
              let parent = this;
              result.points.forEach((point) => {
                  pathPoints.push(parent.parseApiPoint(point))
              });
              let pathObjects = [];
              result.objects.forEach((object) => {
                  pathObjects.push(parent.parseApiObject(object))
              });

              this.updateObjects(pathObjects);
              this.updateRoute(pathPoints);
          });
    };

    createMark = (lat, lon, className) => {
        let mark = new mapboxgl.LngLat(lon, lat);
        let el = document.createElement('div');
        el.className = className;
        return new mapboxgl.Marker(el)
          .setLngLat(mark)
          .addTo(this.map);
    };

    parseApiObject = (object) => {
        return {
            id: object.id,
            title: object.title,
            type: object.type,
            lat: object.position.lat,
            lon: object.position.lon
        }
    };

    parseApiPoint = (point) => {
        return {
            lat: point.lat,
            lon: point.lon
        }
    };

    resetPathPoints = () => {
        this.pathPoints.forEach(function(point) {
            point.marker.remove();
        });
        this.pathPoints = [];
    };

    updateRoute = (pathPointsData) => {
        this.resetPathPoints();

        let coordinates = [];
        pathPointsData.forEach((point) => {
            coordinates.push([point.lon, point.lat]);
        });
        this.map.addSource('route123', {
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
        this.map.addLayer({
            'id': 'route123',
            'type': 'line',
            'source': 'route123',
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

    resetMapObjects = () => {
        this.objects.forEach(function(point) {
            point.marker.remove();
        });
        this.objects = [];
    };

    updateObjects = (objectsData) => {
        this.resetMapObjects();

        objectsData.forEach((object) => {
           this.objects.push({
              data: object,
              marker: this.setMarker(object.lat, object.lon)
           });
        });
    };

    updateMap = (bounds) => {
        let southWest = bounds.getSouthWest();
        let northEast = bounds.getNorthEast();
        let stringBounds = '' + southWest.lat + ',' + southWest.lng + ';' + northEast.lat + ',' + northEast.lng + '?count=20';
        fetch('http://127.0.0.1:1323/api/objects/getFeatured/' + stringBounds)
          .then(res => res.json())
          .then(result => {
              let points = [];
              let parent = this;
              result.forEach((point) => {
                  points.push(parent.parseApiObject(point))
              });
              this.updateObjects(points);
          });
    };

    componentDidMount() {
        this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/light-v10',
            center: [this.state.lon, this.state.lat],
            zoom: this.state.zoom
        });

        this.map.on('mouseup', () => {
            this.setState({
                lon: this.map.getCenter().lng.toFixed(4),
                lat: this.map.getCenter().lat.toFixed(4),
                zoom: this.map.getZoom().toFixed(2)
            });

            let mapBounds = this.map.getBounds();
            this.updateMap(mapBounds);
        })
          .on('click', (data) => {
              if (!this.start) {
                  this.setStartMark(data.lngLat.lat, data.lngLat.lng);
              } else {
                  this.setEndMark(data.lngLat.lat, data.lngLat.lng);
              }
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
