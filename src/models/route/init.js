import {apiGetPathMock} from "../mocks";
import {apiParseObject} from '../app';
import {createRouteEvent, filledRoute, getPathFx, removeRouteEvent, removeRouteMarkersFx} from './index'
import {updateRandomObjectsEvent} from "../objects";
import {pointsParse} from '../points';
import {$route} from './state'
import {$map} from "../map/state";
import {createRouteObjectMarkersFx, drawLineFx, removeRouteFromMapFx} from "../map";
import {forward, sample} from "effector";

getPathFx.use(async ({api, ...payload}) => {
    const result =  await fetch(`${api}routes/get`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
    return result.json();
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


// todo: make guard with isDev filter
forward({
    from: getPathFx.fail.map(({params}) => {
        return {
          result: apiGetPathMock(params.points)
        }
    }),
    to: getPathFx.done
});

forward({
  from: getPathFx.done.map(() => []),
  to: [updateRandomObjectsEvent, removeRouteEvent]
});

forward({
  from: getPathFx.doneData.map((route) => {
    const points = route.points ? route.points.map(({lat, lon}) => {
      return {
        lat,
        lon
      };
    }) : [];
    const objects = route.objects ? route.objects.map(apiParseObject) : [];
    return {
      points,
      objects,
      id: route.id,
      length: route.length,
      time: route.time,
      name: route.name,
      type: route.type,
    };
  }),
  to: createRouteEvent
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
