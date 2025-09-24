const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDGLozMAqDoQdP_znYi3mbebUomE-_O6hU",
    authDomain: "lerunners.firebaseapp.com",
    databaseURL: "https://lerunners-default-rtdb.firebaseio.com",
    projectId: "lerunners",
    storageBucket: "lerunners.appspot.com",
    messagingSenderId: "786096020973",
    appId: "1:786096020973:web:334dc555218cedb0e1dbe4"
};

const CLOUDINARY_CONFIG = {
    CLOUD_NAME: "dd6ppm6nf",
    API_KEY: "845911223412467",
    API_SECRET: "S6YefZx7J5StgcTV-greU4wFhP4"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
}
