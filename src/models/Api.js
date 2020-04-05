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

};

export const apiUrlGetFeatured = (southWest, northEast) => {
    let stringBounds = '' + southWest.lat + ',' + southWest.lng + ';' + northEast.lat + ',' + northEast.lng + '?count=20';
    return 'http://127.0.0.1:1323/api/objects/getFeatured/' + stringBounds;
};