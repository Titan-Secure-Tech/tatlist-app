import firebase from 'firebase';

export const getProducts = (props) => {
    let productsRef = firebase.database.ref('/Products');
    productsRef.on('value', (snapshot) => {
      let data = snapshot.val();
      let products = Object.values(data);
      return products;
    });
  }

