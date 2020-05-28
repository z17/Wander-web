import {createEvent} from 'effector';

export const setConfig = createEvent();

export const apiParseObject = (object) => ({
      id: object.id,
      title: object.title,
      type: object.type,
      lat: object.position.lat,
      lon: object.position.lon,
      image: object.image,
      description: object.description
});
