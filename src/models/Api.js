import {default_lat, default_lon} from "./map";

const api = 'http://127.0.0.1:1323/api/';

export const apiParseObject = (object) => {
    return {
        id: object.id,
        title: object.title,
        type: object.type,
        lat: object.position.lat,
        lon: object.position.lon,
        image: object.image,
        description: object.description
    }
};

export const apiParseRoute = (route) => {
    return {
        id: route.id,
        length: route.length,
        time: route.time,
        name: route.name,
        type: route.type,
        points: route.points ? route.points.map(apiParsePoint) : [],
        objects: route.objects ? route.objects.map(apiParseObject) : []
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
    return api + 'objects/getFeatured/' + stringBounds;
};

export const apiUrlGetPath = () => {
    return api + 'routes/get';
};

export const apiBuildGetDirectPathRequest = (startLat, startLng, endLat, endLng) => {
    return {
        points: [
            {
                lat: startLat,
                lon: startLng,
            },
            {
                lat: endLat,
                lon: endLng,
            }

        ],
        type: 'direct'
    };
};

export const apiBuildGetRoundPathRequest = (startLat, startLng) => {
    return {
        points: [
            {
                lat: startLat,
                lon: startLng,
            }

        ],
        radius: 1000,
        type: 'round'
    };
};

export const apiGetPathMock = (positions) => {
    let type;
    let start;
    let end;
    let minLat = 0;
    let maxLat = 0;
    let minLon = 0;
    let maxLon = 0;
    if (positions.start && positions.end) {
        type = 'direct';
        start = positions.start.getLngLat();
        end = positions.end.getLngLat();
        minLat = Math.min(start.lat, end.lat) - 0.03;
        maxLat = Math.max(start.lat, end.lat) + 0.03;
        minLon = Math.min(start.lng, end.lng) - 0.03;
        maxLon = Math.max(start.lng, end.lng) + 0.03;
    } else if (positions.round) {
        type = 'round';
        start = positions.round.getLngLat();
        end = positions.round.getLngLat();
        minLat = start.lat - 0.03;
        maxLat = start.lat + 0.03;
        minLon = start.lng - 0.03;
        maxLon = start.lng + 0.03;
    }

    const objects = apiGetFeaturedMock(10, minLat, maxLat, minLon, maxLon);
    const pathPoints = objects.map((o) => ({lat: o.position.lat, lon: o.position.lon}));
    pathPoints.unshift({
        lat: start.lat,
        lon: start.lng,
    });
    pathPoints.push({
        lat: end.lat,
        lon: end.lng,
    });

    return {
        id: 535,
        length: 5324,
        time: 24 * 60 * 60,
        name: 'Mocked route',
        type: type,
        points: pathPoints,
        objects: objects
    }
};

export const apiGetFeaturedMock = (count = false, minLat = false, maxLat = false, minLon = false, maxLon = false) => {
    if (!count) {
        const min = 10;
        const max = 50;
        count = Math.random() * (max - min) + min
    }

    if (!minLat) {
        minLat = default_lat - 0.1;
    }

    if (!minLon) {
        minLon = default_lon - 0.1;
    }

    if (!maxLat) {
        maxLat = default_lat + 0.1;
    }

    if (!maxLon) {
        maxLon = default_lon + 0.1;
    }
    const points = [];
    for (let i = 0; i < count; i++) {
        const lat = Math.random() * (maxLat - minLat) + minLat;
        const lon = Math.random() * (maxLon - minLon) + minLon;
        points.push(
            {
                id: i,
                title: 'Mocked object id ' + i,
                type: 'museum',
                position: {
                    lat: lat,
                    lon: lon,
                },
                image: 'https://mos-holidays.ru/spb/wp-content/uploads/sites/2/2018/05/%D1%81%D0%BE%D0%B1%D0%BE%D1%802.jpg',
                description: 'test desc'
            }
        );
    }
    return points;
};