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

export const apiGetFeaturedMock = () => {
    const min = 10;
    const max = 50;
    const count = Math.random() * (max - min) + min;
    const points = [];
    for (let i = 0; i < count; i++) {
        const latDiff = Math.random() - 0.5;
        const lonDiff = Math.random() - 0.5;
        points.push(
            {
                id: i,
                title: 'test',
                type: 'museum',
                position: {
                    lat: default_lat + latDiff,
                    lon: default_lon + lonDiff,
                },
                image: null,
                description: 'test desc'
            }
        );
    }
    return points;
};
