import {guard, merge, sample, forward} from "effector";
import {
    setEndPointEvent,
    setRoundPointEvent,
    setStartPointEvent,
    createObjectMarkersFx,
    createRouteObjectMarkersFx,
    mapBoundsUpdatedEvent,
    getRandomPointsFx,
    setStartMarkerEvent,
    setEndMarkerEvent,
    setRoundMarkerEvent,
    removeRouteFromMapFx,
    drawLineFx, mapPositionUpdatedEvent, selectPositionEvent
} from "./index";
import {createEndPointFx, createRoundPointFx, createdStartMark, createdEndMark, createdRoundMark, pathPositionsReady} from "../points";
import {$points, $routePositionsReady} from "../points/state";
import {MapGate} from "../../components/Map";
import {$map, $mapSettings} from "./state";
import {$noRoute} from '../route/state'
import {$config} from '../app/state';
import mapboxgl from "mapbox-gl";

import {createMapFx} from './index'
import {apiGetFeaturedMock} from "../Api";

import {createMark} from "../points/init";

createMapFx.use(({lat, lon, zoom}) => {
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

        mapBoundsUpdatedEvent(map.getBounds());
    }).on('click', (data) => {
        selectPositionEvent(data.lngLat);
    });

    return {map}
});

const createPointMark = (lat, lon, map) => {
    return createMark(lat, lon, 'App-map_marker_point', map)
};

//уложить в дату-флоу это
const createObjectMarkers = ({objects, map}) => {
    return objects.map((object) => {
        const {lat, lon} = object;
        return {data: object, marker: createPointMark(lat, lon, map)}
    });
};

createRouteObjectMarkersFx.use(createObjectMarkers);
createObjectMarkersFx.use(createObjectMarkers);

getRandomPointsFx.use(async ({bounds, api}) => {
    const {lat: SWlat, lng: SWlng} = bounds.getSouthWest();
    const {lat: NElat, lng: NElng} = bounds.getNorthEast();
    const boundsAsURLParams = `${SWlat},${SWlng};${NElat},${NElng}'?count=20`;
    const res = await fetch(`${api}objects/getFeatured/${boundsAsURLParams}`);
    return res.json();
});

forward({
  from: getRandomPointsFx.doneData, [point[0], point[1]]
  to: objectsParse //апи со многими объектами
})

// todo: make guard with isDev filter
forward({
    from: getRandomPointsFx.fail.map(() => ({result: apiGetFeaturedMock()})),
    to: getRandomPointsFx.done
});

removeRouteFromMapFx.use(({map, route}) => {
    let old_route_map_id = 'route' + route.id;
    map.removeLayer(old_route_map_id);
    map.removeSource(old_route_map_id);
});

$map.on(createMapFx.done, (state, {result: {map}}) => {
    return {map};
});

$mapSettings.on(mapPositionUpdatedEvent, function (state, {lat, lon, zoom}) {
    return {
        ...state,
        lat: lat,
        lon: lon,
        zoom: zoom
    }
});

drawLineFx.use(({map, route_map_id, coordinates}) => {
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

});


forward({
    from: MapGate.open,
    to: createMapFx
});

forward({
    from: createMapFx.done.map(({result}) => {
        return result.map.getBounds()
    }),
    to: mapBoundsUpdatedEvent
});


// эти три сэмлпа можно заменить прямым вызовом
sample({
    source: {map: $map, points: $points},
    clock: setStartPointEvent,
    fn: ({map, points}) => ({lat: points.selected.lat, lng: point.selected.lng, map}),
    target: createdStartMark
});

sample({
    source: {map: $map, points: $points},
    clock: setEndPointEvent,
    fn: ({map, points}) => ({lat: points.selected.lat, lng: point.selected.lng, map}),
    target: createdEndMark,
});

sample({
    source: {map: $map, points: $points},
    clock: setRoundPointEvent,
    fn: ({map, points}) => ({lat: points.selected.lat, lng: point.selected.lng, map}),
    target: createdRoundMark,
});

guard({
    source: {config: $config, bounds: mapBoundsUpdatedEvent},
    filter: $noRoute,
    fn: ({config, bounds}) => ({api: config.api, bounds}),
    target: getRandomPointsFx
});

const setAnyPositionMarker = merge([setStartMarkerEvent, setEndMarkerEvent, setRoundMarkerEvent]);

guard({
    source: setAnyPositionMarker,
    filter: $routePositionsReady,
    target: pathPositionsReady
});
