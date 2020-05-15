import {guard, merge, sample, forward, attach} from "effector";
import mapboxgl from "mapbox-gl";
import {
  createMapFx,
  setEndPointEvent,
  setRoundPointEvent,
  setStartPointEvent,
  setPoint,
  createObjectMarkersFx,
  createRouteObjectMarkersFx,
  mapBoundsUpdatedEvent,
  getRandomPointsFx,
  setStartMarkerEvent,
  setEndMarkerEvent,
  setRoundMarkerEvent,
  removeRouteFromMapFx,
  drawLineFx,
  mapPositionUpdatedEvent,
  selectPositionEvent,
  MapGate
} from "./index";
import {
  createEndPointFx, createRoundPointFx, createdStartMark, createdEndMark,
  createdRoundMark, createdPointMark, pathPositionsReady, createMarkFx
} from "../points";
import {$points, $routePositionsReady} from "../points/state";
import {$map, $mapSettings} from "./state";
import {$noRoute} from '../route/state';
import {objectsParse} from '../app';
import {$config} from '../app/state';
import {apiGetFeaturedMock} from "../mocks";

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

const createObjectMarkers = ({objects, map}) => {
    return objects.map((object) => {
        const {lat, lon: lng} = object;
          return {data: object, marker: createdPointMark({lat, lng, map})}
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
const getRandomPointsFxWithApi = attach({
  source: {config: $config},
  effect: getRandomPointsFx,
  mapParams: (bounds, {config}) => ({bounds, api: config.api})
});

removeRouteFromMapFx.use(({map, route}) => {
    let old_route_map_id = 'route' + route.id;
    map.removeLayer(old_route_map_id);
    map.removeSource(old_route_map_id);
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

forward({
  from: getRandomPointsFx.doneData,
  to: objectsParse
})

// todo: make guard with isDev filter
forward({
    from: getRandomPointsFx.fail.map(() => ({result: apiGetFeaturedMock()})),
    to: getRandomPointsFx.done
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

const createdMark = attach({
  source: {map: $map, points: $points},
  effect: createMarkFx,
  mapParams: (type, {points, map}) => ({className: `App-map_marker_${type}`, map: map.map, ...points.selected})
});
forward({
  from: setPoint,
  to: createdMark
});
guard({
    source: mapBoundsUpdatedEvent,
    filter: $noRoute,
    target: getRandomPointsFxWithApi
});

const setAnyPositionMarker = merge([setStartMarkerEvent, setEndMarkerEvent, setRoundMarkerEvent]);

guard({
    source: setAnyPositionMarker,
    filter: $routePositionsReady,
    target: pathPositionsReady
});
