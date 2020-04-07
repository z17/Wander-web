import React from 'react';
import {createEffect, createEvent, createStore, forward, guard, merge, sample} from 'effector'
import {createGate, useStore} from 'effector-react'

import './Map.css';
import {sidebarSetField} from '../Sidebar';

import mapboxgl from 'mapbox-gl';
import {default_lat, default_lon, default_zoom} from "../../models/Map";
import {apiParseObject, apiParseRoute, apiUrlGetFeatured, apiUrlGetPath} from "../../models/Api";

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
const createRouteEvent = createEvent('updateRandomPoints');
const removeRouteEvent = createEvent('updateRandomPoints');

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

guard({
    source: mapBoundsUpdatedEvent,
    filter: mapStore.map(({route}) => {
        return !route
    }),
    target: getRandomPointsFx
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
}).on(removeRouteEvent, (state) => {
    if (state.route) {
        let old_route_map_id = 'route' + state.route.id;
        state.map.removeLayer(old_route_map_id);
        state.map.removeSource(old_route_map_id);
    }
    if (state.route_markers) {
        state.route_markers.forEach(function (point) {
            point.marker.remove();
        });
    }
    return {...state, route: null, route_markers: null}
}).on(createRouteEvent, (state, route) => {
    const map = state.map;
    let points = route.points;
    let objects = route.objects;
    let route_map_id = 'route' + route.id;

    const route_markers= [];
    objects.forEach((object) => {
        route_markers.push({
            data: object,
            marker: createMark(object.lat, object.lon, 'App-map_marker_point', state.map)
        });
    });

    let coordinates = [];
    points.forEach((point) => {
        coordinates.push([point.lon, point.lat]);
    });

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
    return {...state, route: route, route_markers: route_markers}
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

const merged = merge([setStartMarkerEvent, setEndMarkerEvent, setRoundMarkerEvent]);
const hasStartAndEnd = pointsStore.map(({start, end, round}) => {
    return start !== null && end !== null || round !== null
});

const getDirectPathFx = createEffect();
const pathPositionsReady = createEvent();

getDirectPathFx.use(async ({pointsStore}) => {
    let request = {};
    if (pointsStore.start && pointsStore.end) {
        request = {
            points: [
                {
                    lat: pointsStore.start.getLngLat().lat,
                    lon: pointsStore.start.getLngLat().lng,
                },
                {
                    lat: pointsStore.end.getLngLat().lat,
                    lon: pointsStore.end.getLngLat().lng,
                }

            ],
            type: 'direct'
        };
    } else if (pointsStore.round) {
        request = {
            points: [
                {
                    lat: pointsStore.round.getLngLat().lat,
                    lon: pointsStore.round.getLngLat().lng,
                }

            ],
            radius: 1000,
            type: 'round'
        };
    }

    const result =  await fetch(apiUrlGetPath(), {
        method: 'POST',
        body: JSON.stringify(request)
    });
    return result.json();
});

getDirectPathFx.done.watch(({result}) => {
    const route = apiParseRoute(result);

    updateRandomPointsEvent([]);
    removeRouteEvent(route);
    createRouteEvent(route);
});

guard({
    source: merged,
    filter: hasStartAndEnd,
    target: pathPositionsReady
});

sample({
    source: {pointsStore, mapStore},
    clock: pathPositionsReady,
    target: getDirectPathFx,
});

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
