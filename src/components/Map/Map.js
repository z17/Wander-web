import React from 'react';
import {createEffect, createEvent, createStore, forward, guard, merge, sample} from 'effector'
import {createGate, useStore} from 'effector-react'

import './Map.css';
import {sidebarSetField} from '../Sidebar';

import mapboxgl from 'mapbox-gl';
import {default_lat, default_lon, default_zoom} from "../../models/Map";
import {apiParseObject, apiUrlGetFeatured} from "../../models/Api";

const selectPositionEvent = createEvent('selectPosition');
const setStartPointEvent = createEvent('setStartPoint');
const setStartMarkerEvent = createEvent('setStartMarker');
const setEndPointEvent = createEvent('setEndPoint');
const setEndMarkerEvent = createEvent('setEndMarker');
const setRoundPointEvent = createEvent('setRoundPoint');
const setRoundMarkerEvent = createEvent('setRoundMarker');
const mapPositionUpdatedEvent = createEvent('mapPositionUpdated');
const mapBoundsUpdatedEvent = createEvent('mapBoundsUpdated');
const updateRandomPointsEvent = createEvent('updateRandomPoints');

const pointsStore = createStore({
    selected: null,
    start: null,
    end: null,
    round: null
}).on(selectPositionEvent, (state, value) => {
    return {
        ...state,
        selected: value
    }
}).on(setStartMarkerEvent, (state, value) => {
    if (state.start) {
        state.start.remove();
    }
    return {
        ...state,
        start: value
    }
}).on(setEndMarkerEvent, (state, value) => {
    if (state.end) {
        state.end.remove();
    }
    return {
        ...state,
        end: value
    }
}).on(setRoundMarkerEvent, (state, value) => {
    if (state.round) {
        state.round.remove();
    }
    return {
        ...state,
        round: value
    }
});

const mapStore = createStore({});

const mapPositionStore = createStore({
    lat: default_lat,
    lon: default_lon,
    zoom: default_zoom,
}).on(mapPositionUpdatedEvent, function (state, {lat, lon, zoom}) {
    return {
        ...state,
        lat: lat,
        lon: lon,
        zoom: zoom
    }
});

const Gate = createGate('gate with props');

const createMark = (lat, lon, className, map) => {
    let mark = new mapboxgl.LngLat(lon, lat);
    let el = document.createElement('div');
    el.className = className;
    return new mapboxgl.Marker(el)
        .setLngLat(mark)
        .addTo(map);
};

const createStartPointFx = createEffect();
const createEndPointFx = createEffect();
const createRoundPointFx = createEffect();

createStartPointFx.use((data) => {
    const {mapStore, pointsStore} = data;
    const startMarker = createMark(pointsStore.selected.lat, pointsStore.selected.lng, 'App-map_marker_start', mapStore.map);
    startMarker.getElement().addEventListener('click', (event) => {
        setStartMarkerEvent(null);
        event.stopPropagation();
    });

    setRoundMarkerEvent(null);
    setStartMarkerEvent(startMarker);
    sidebarSetField({
        lat: pointsStore.selected.lat,
        lng: pointsStore.selected.lng,
        field: 'from',
    });
});

createEndPointFx.use((data) => {
    const {mapStore, pointsStore} = data;
    const endMarker = createMark(pointsStore.selected.lat, pointsStore.selected.lng, 'App-map_marker_end', mapStore.map);
    endMarker.getElement().addEventListener('click', (event) => {
        setEndMarkerEvent(null);
        event.stopPropagation();
    });

    setRoundMarkerEvent(null);
    setEndMarkerEvent(endMarker);
    sidebarSetField({
        lat: pointsStore.selected.lat,
        lng: pointsStore.selected.lng,
        field: 'to'
    });
});

createRoundPointFx.use((data) => {
    const {mapStore, pointsStore} = data;
    const roundMarker = createMark(pointsStore.selected.lat, pointsStore.selected.lng, 'App-map_marker_round', mapStore.map);
    roundMarker.getElement().addEventListener('click', (event) => {
        setRoundMarkerEvent(null);
        event.stopPropagation();
    });

    setStartMarkerEvent(null);
    setEndMarkerEvent(null);
    setRoundMarkerEvent(roundMarker);
});

sample({
    source: {mapStore, pointsStore},
    clock: setStartPointEvent,
    target: createStartPointFx,
});

sample({
    source: {mapStore, pointsStore},
    clock: setEndPointEvent,
    target: createEndPointFx,
});

sample({
    source: {mapStore, pointsStore},
    clock: setRoundPointEvent,
    target: createRoundPointFx,
});

createStartPointFx.watch(console.log);

const getRandomPointsFx = createEffect();

getRandomPointsFx.use(async (bounds) => {
        let southWest = bounds.getSouthWest();
        let northEast = bounds.getNorthEast();
        const res = await fetch(apiUrlGetFeatured(southWest, northEast));
        return res.json();
    }
);

getRandomPointsFx.done.watch(({result}) => {
    let points = [];
    result.forEach((point) => {
        points.push(apiParseObject(point))
    });
    updateRandomPointsEvent(points);
});

forward({
    from: mapBoundsUpdatedEvent,
    to: getRandomPointsFx,
});


mapStore.on(updateRandomPointsEvent, (state, points) => {
    if (state.random_points) {
        state.random_points.forEach(function (point) {
            point.marker.remove();
        });
    }

    const random_points = [];
    points.forEach((object) => {
        random_points.push({
            data: object,
            marker: createMark(object.lat, object.lon, 'App-map_marker_point', state.map)
        });
    });
    return {...state, random_points: random_points}
});

mapStore.on(Gate.open, (state, {lat, lon, zoom}) => {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [lon, lat],
        zoom
    });

    map.on('mouseup', () => {
        mapPositionUpdatedEvent({
            lat: map.getCenter().lat.toFixed(4),
            lon: map.getCenter().lng.toFixed(4),
            zoom: map.getZoom().toFixed(2)
        });

        let mapBounds = map.getBounds();
        mapBoundsUpdatedEvent(mapBounds);
    })
    .on('click', (data) => {
        selectPositionEvent(data.lngLat);
    });

    return {map};
});

const merged = merge([setStartMarkerEvent, setEndMarkerEvent]);
const hasStartAndEnd = pointsStore.map(({start, end}) => {
    return start !== null && end !== null
});

const getDirectPathFx = createEffect();

getDirectPathFx.use(async (url, ab, c) => {
    console.log(url);
    console.log(ab);
});

guard({
    source: merged,
    filter: hasStartAndEnd,
    target: getDirectPathFx
});

class Map2 extends React.Component {
    state = {
        lat: default_lat,
        lon: default_lon,
        zoom: default_zoom,
        selected_position: false,
    };

    map = {};

    objects = [];
    route = false;

    start = null;
    end = null;
    round = null;

    setMarker = (lat, lon) => {
        return this.createMark(lat, lon, 'App-map_marker_point');
    };

    setStartMark = (lat, lon) => {
        this.removeStartMark();
        this.removeRoundMark();

        this.start = this.createMark(lat, lon, 'App-map_marker_start');
        this.start.getElement().addEventListener('click', (event) => {
            this.removeStartMark();
            this.removeRoute();
            event.stopPropagation();
        });

        if (this.end && this.start) {
            this.buildRoute();
        }
    };

    setEndMark = (lat, lon) => {
        this.removeEndMark();
        this.removeRoundMark();

        this.end = this.createMark(lat, lon, 'App-map_marker_end');
        this.end.getElement().addEventListener('click', (event) => {
            this.removeEndMark();
            this.removeRoute();
            event.stopPropagation();
        });

        if (this.end && this.start) {
            this.buildRoute();
        }
    };

    removeStartMark = () => {
        if (this.start) {
            this.start.remove();
            this.start = null;
        }
    };

    removeEndMark = () => {
        if (this.end) {
            this.end.remove();
            this.end = null;
        }
    };

    removeRoundMark = () => {
        if (this.round) {
            this.round.remove();
            this.round = null;
        }
    };

    setRoundMark = (lat, lon) => {
        this.removeEndMark();
        this.removeStartMark();
        this.removeRoundMark();

        this.round = this.createMark(lat, lon, 'App-map_marker_round');
        this.round.getElement().addEventListener('click', (event) => {
            this.removeRoundMark();
            this.removeRoute();
            event.stopPropagation();
        });
        this.buildRoute();
    };

    buildRoute = () => {

        let request = {};
        if (this.start && this.end) {
            request = {
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
            };
        } else if (this.round) {
            request = {
                points: [
                    {
                        lat: this.round.getLngLat().lat,
                        lon: this.round.getLngLat().lng,
                    }

                ],
                radius: 1000,
                type: 'round'
            };
        }

        fetch('http://127.0.0.1:1323/api/routes/get', {
            method: 'POST',
            body: JSON.stringify(request)
        })
          .then(result => result.json())
          .then(result => {
              let route = this.parseApiRoute(result);
              this.updateRoute(route);
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

    parseApiRoute = (route) => {
      return {
          id: route.id,
          length: route.length,
          time: route.time,
          name: route.name,
          type: route.type,
          points: route.points.map(this.parseApiPoint),
          objects: route.objects.map(this.parseApiObject)
      }
    };

    removeRoute = () => {
        if (this.route) {
            this.resetMapObjects();
            let old_route_map_id = 'route' + this.route.id;
            this.map.removeLayer(old_route_map_id);
            this.map.removeSource(old_route_map_id);
            this.route = false;
        }
    };

    updateRoute = (route) => {
        this.removeRoute();

        this.updateObjects(route.objects);

        let points = route.points;
        let route_map_id = 'route' + route.id;

        let coordinates = [];
        points.forEach((point) => {
            coordinates.push([point.lon, point.lat]);
        });

        this.map.addSource(route_map_id, {
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

        this.route = route;
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

    updateRandomObjects = (bounds) => {
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

    setStartPoint = () => {
        this.setStartMark(this.state.selected_position.lat, this.state.selected_position.lng);

        selectPositionEvent(null);
    };

    setEndPoint = () => {
        this.setEndMark(this.state.selected_position.lat, this.state.selected_position.lng);
        selectPositionEvent(null);
    };

    setRoundPoint = () => {
        this.setRoundMark(this.state.selected_position.lat, this.state.selected_position.lng);
        selectPositionEvent(null);
    };

    componentDidMount() {
        this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/light-v10',
            center: [this.state.lon, this.state.lat],
            zoom: this.state.zoom
        });

        this.map
            .on('mouseup', () => {
            this.setState({
                lon: this.map.getCenter().lng.toFixed(4),
                lat: this.map.getCenter().lat.toFixed(4),
                zoom: this.map.getZoom().toFixed(2)
            });

            let mapBounds = this.map.getBounds();
            if (!this.route) {
                this.updateRandomObjects(mapBounds);
            }
        })
          .on('click', (data) => {
              const lngLat = data.lngLat;
              selectPositionEvent(lngLat);
          });
    }
}

const Map = () => {
    const selected = 1;

    const positionStore = useStore(mapPositionStore);

    return (
        <React.Fragment>
            <Gate {...positionStore}/>
            <div className="App-map__wrapper">
                <div className="App-map__sidebar">
                    <div>Longitude: {positionStore.lon} | Latitude: {positionStore.lat} | Zoom: {positionStore.zoom}</div>
                </div>
                {selected && <div className="App-map__menu">
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
