import {
    apiBuildGetDirectPathRequest,
    apiBuildGetRoundPathRequest,
    apiGetPathMock,
    apiParseRoute,
    apiUrlGetPath
} from "../Api";
import {createRouteEvent, filledRoute, getDirectPathFx, removeRouteEvent, removeRouteMarkersFx} from './index'
import {updateRandomPointsEvent} from "../objects";
import {$route} from './state'
import {$map} from "../map/state";
import {createRouteObjectMarkersFx, drawLineFx, removeRouteFromMapFx} from "../map";
import {forward, sample} from "effector";

getDirectPathFx.use(async ({points}) => {
    let request = {};
    if (points.start && points.end) {
        const start = points.start.getLngLat();
        const end = points.end.getLngLat();
        request = apiBuildGetDirectPathRequest(start.lat, start.lng, end.lat, end.lng);
    } else if (points.round) {
        const round = points.round.getLngLat();
        request = apiBuildGetRoundPathRequest(round.lat, round.lng);
    }

    const result =  await fetch(apiUrlGetPath(), {
        method: 'POST',
        body: JSON.stringify(request)
    });
    return result.json();
});

// todo: make guard with isDev filter
forward({
    from: getDirectPathFx.fail.map(({params}) => {
        return {result: apiGetPathMock(params.points)}}),
    to: getDirectPathFx.done
});

getDirectPathFx.done.watch(({result}) => {
    const route = apiParseRoute(result);

    updateRandomPointsEvent([]);
    removeRouteEvent();
    createRouteEvent(route);
});


removeRouteMarkersFx.use((route) => {
    route.route_markers.forEach(function (point) {
        point.marker.remove();
    });
});

$route.on(removeRouteMarkersFx.done, () => {
    return {
        route: null,
        route_markers: []
    }
}).on(filledRoute, (state, {route, route_markers}) => {
    return {route, route_markers}
});


sample({
    source: {map: $map, route: $route},
    clock: removeRouteEvent,
    target: removeRouteFromMapFx, // todo: dont call it when we havn't route
    fn: (source) => ({map: source.map.map, route: source.route.route})
});

sample({
    source: $route,
    clock: removeRouteEvent,
    target: removeRouteMarkersFx,
});

sample({
    source: $map,
    clock: createRouteEvent,
    target: createRouteObjectMarkersFx,
    fn: (source, clock) => ({objects: clock.objects, map: source.map})
});

sample({
    source: $map,
    clock: createRouteEvent,
    target: drawLineFx,
    fn: (map, route) => {
        let route_map_id = 'route' + route.id;
        let points = route.points;
        let coordinates = [];
        points.forEach((point) => {
            coordinates.push([point.lon, point.lat]);
        });
        return {map: map.map, route_map_id, coordinates};
    }
});

sample({
    source: createRouteEvent,
    clock: createRouteObjectMarkersFx.doneData,
    target: filledRoute,
    fn: (source, clock) => ({
        route: source,
        route_markers: clock
    })
});