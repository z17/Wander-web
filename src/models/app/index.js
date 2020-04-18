import {createEvent} from 'effector';

export const setConfig = createEvent();
export const objectsParse = createEvent();

export const objectsParsed = objectsParse.map((objects) => objects.map((object) => {
  return {
        id: object.id,
        title: object.title,
        type: object.type,
        lat: object.position.lat,
        lon: object.position.lon,
        image: object.image,
        description: object.description
  }
}));
