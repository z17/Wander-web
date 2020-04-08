import {createEffect, createEvent, createStore, guard, merge, sample} from "effector";

import {
    createEndMark,
    createMap,
    createPointMark,
    createRoundMark,
    createRouteLine,
    createStartMark,
    MapGate
} from "../components/Map";
import {sidebarSetField} from "../components/Sidebar";
import {
    apiBuildGetDirectPathRequest,
    apiBuildGetRoundPathRequest,
    apiParseObject,
    apiParseRoute,
    apiUrlGetFeatured,
    apiUrlGetPath
} from "./Api";

export const default_lat = 59.9402;
export const default_lon = 30.3154;
export const default_zoom = 12;

export const mapbox_access_key = 'pk.eyJ1Ijoiei0xNyIsImEiOiJjazZ1c3dkM2gwY2RkM2VueHh5bTdubTV6In0.3l6vnKrR964Fme8IPQ_eQA';

export const setStartPointEvent = createEvent('setStartPoint');
export const setEndPointEvent = createEvent('setEndPoint');
export const setRoundPointEvent = createEvent('setRoundPoint');

const setStartMarkerEvent = createEvent('setStartMarker');
const setEndMarkerEvent = createEvent('setEndMarker');
const setRoundMarkerEvent = createEvent('setRoundMarker');

const selectPositionEvent = createEvent('selectPosition');
const mapPositionUpdatedEvent = createEvent('mapPositionUpdated');
const mapBoundsUpdatedEvent = createEvent('mapBoundsUpdated');
const updateRandomPointsEvent = createEvent('updateRandomPoints');
const createRouteEvent = createEvent('updateRandomPoints');
const removeRouteEvent = createEvent('updateRandomPoints');

export const mapStore = createStore({
    random_points: null,
    route_markers: null,
    route: null,
});

export const pointsStore = createStore({
    selected: null,
    start: null,
    end: null,
    round: null
});

export const mapPositionStore = createStore({
    lat: default_lat,
    lon: default_lon,
    zoom: default_zoom,
});

const createStartPointFx = createEffect();
const createEndPointFx = createEffect();
const createRoundPointFx = createEffect();
const getRandomPointsFx = createEffect();
const getDirectPathFx = createEffect();
const pathPositionsReady = createEvent();

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
            marker: createPointMark(object.lat, object.lon, state.map)
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
            marker: createPointMark(object.lat, object.lon, state.map)
        });
    });

    let coordinates = [];
    points.forEach((point) => {
        coordinates.push([point.lon, point.lat]);
    });

    createRouteLine(map, route_map_id, coordinates);

    return {...state, route: route, route_markers: route_markers}
}).on(MapGate.open, (state, {lat, lon, zoom}) => {
    const map = createMap(lon, lat, zoom);

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

    let mapBounds = map.getBounds();
    mapBoundsUpdatedEvent(mapBounds);
    return {map};
});

pointsStore.on(selectPositionEvent, (state, value) => {
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

mapPositionStore.on(mapPositionUpdatedEvent, function (state, {lat, lon, zoom}) {
    return {
        ...state,
        lat: lat,
        lon: lon,
        zoom: zoom
    }
});

createStartPointFx.use((data) => {
    const {mapStore, pointsStore} = data;
    const startMarker = createStartMark(pointsStore.selected.lat, pointsStore.selected.lng, mapStore.map);
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
    const endMarker = createEndMark(pointsStore.selected.lat, pointsStore.selected.lng, mapStore.map);
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
    const roundMarker = createRoundMark(pointsStore.selected.lat, pointsStore.selected.lng, mapStore.map);
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

const merged = merge([setStartMarkerEvent, setEndMarkerEvent, setRoundMarkerEvent]);
const hasStartAndEnd = pointsStore.map(({start, end, round}) => {
    return start !== null && end !== null || round !== null
});

getDirectPathFx.use(async ({pointsStore}) => {
    let request = {};
    if (pointsStore.start && pointsStore.end) {
        const start = pointsStore.start.getLngLat();
        const end = pointsStore.end.getLngLat();
        request = apiBuildGetDirectPathRequest(start.lat, start.lng, end.lat, end.lng);
    } else if (pointsStore.round) {
        const round = pointsStore.round.getLngLat();
        request = apiBuildGetRoundPathRequest(round.lat, round.lng);
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
