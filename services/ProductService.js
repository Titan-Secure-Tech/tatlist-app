// ProductService.js

import { db } from '../db';

export const getProducts =  (product) => {
  db.ref('/tatlist-d67bd').push({
    name: product
  });
}

