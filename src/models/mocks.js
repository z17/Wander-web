import {default_lat, default_lon} from "./map";

export const apiGetPathMock = (positions) => {
    let type;
    let minLat = 0;
    let maxLat = 0;
    let minLon = 0;
    let maxLon = 0;
    const [start, end] = positions;
    if (end) {
        type = 'direct';
        minLat = Math.min(start.lat, end.lat) - 0.03;
        maxLat = Math.max(start.lat, end.lat) + 0.03;
        minLon = Math.min(start.lng, end.lng) - 0.03;
        maxLon = Math.max(start.lng, end.lng) + 0.03;
    } else {
        type = 'round';
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
        lat: end ? end.lat : start.lat,
        lon: end ? end.lng : start.lng,
    });

    let id = Math.ceil(Math.random() * 1000);
    return {
        id: id,
        length: 5324,
        time: 24 * 60 * 60,
        name: 'Mocked route ' + id,
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
