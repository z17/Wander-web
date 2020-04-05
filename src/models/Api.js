export const apiParseObject = (object) => {
    return {
        id: object.id,
        title: object.title,
        type: object.type,
        lat: object.position.lat,
        lon: object.position.lon
    }
};

export const apiParseRoute = (route) => {
    return {
        id: route.id,
        length: route.length,
        time: route.time,
        name: route.name,
        type: route.type,
        points: route.points.map(apiParsePoint),
        objects: route.objects.map(apiParseObject)
    }
};

export const apiParsePoint = (point) => {
    return {
        lat: point.lat,
        lon: point.lon
    }
};

export const apiUrlGetFeatured = (southWest, northEast) => {
    let stringBounds = '' + southWest.lat + ',' + southWest.lng + ';' + northEast.lat + ',' + northEast.lng + '?count=20';
    return 'http://127.0.0.1:1323/api/objects/getFeatured/' + stringBounds;
};