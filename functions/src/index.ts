import * as functions from 'firebase-functions';

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();
//
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const handleUserRegistration = functions.auth.user().onCreate( user => {

  admin
    .firestore()
    .collection('users')
    .doc(user.email)
    .set({
      'email' : user.email,
      'displayName' : user.displayName
    })
    .then(writeResult => {
      console.log('user created result: ', writeResult);
      return;
    })
    .catch(err => {
      console.log(err);
      return;
    });
});
