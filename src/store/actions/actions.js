import firebase from "firebase";

import * as actionTypes from "./actionTypes";

import uniqid from "uniqid";

const firebaseConfig = {
  apiKey: "AIzaSyDOvhqLDb20Ss3LqAKs3a1bTwdN1g275Bk",
  authDomain: "pig-game-9803a.firebaseapp.com",
  databaseURL: "https://pig-game-9803a.firebaseio.com",
  projectId: "pig-game-9803a",
  storageBucket: "pig-game-9803a.appspot.com",
  messagingSenderId: "1050798425481",
  appId: "1:1050798425481:web:c672ae2cc0dc722296cd58",
  measurementId: "G-JHMXMVNYTH"
};
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
export const storageRef = storage.ref();

export const authStart = () => {
  return { type: actionTypes.AUTH_START };
};

export const authSuccess = (token, userId, firstname) => {
  return {
    type: actionTypes.AUTH_SUCCESS,
    payload: { token, userId, firstname }
  };
};

export const authFail = error => {
  return { type: actionTypes.AUTH_FAIL, payload: { error } };
};

export const logout = () => {
  localStorage.clear();
  return { type: actionTypes.AUTH_LOGOUT };
};

export const checkAuthTimeout = () => dispatch => {
  setTimeout(() => dispatch(logout()), 3600 * 1000);
};

export const auth = (
  email,
  password,
  isSignup,
  firstname,
  lastname
) => async dispatch => {
  dispatch(authStart());
  try {
    let userName, user, users;
    const buglog = db.collection("buglog");
    if (isSignup) {
      await app.auth().createUserWithEmailAndPassword(email, password);
      user = await app.auth().currentUser;
      user.updateProfile({
        displayName: firstname
      });
      await buglog.doc("LgJ4ax5SWZCeOSPj1GT4").update({
        [user.uid]: {
          id: user.uid,
          firstname,
          lastname,
          email,
          role: "N/A",
          tickets: [],
          notifications: [],
          projects: [],
          accountCreatedDate:
            new Date().toLocaleDateString() +
            " " +
            new Date().toLocaleTimeString(),
          accountId: uniqid()
        }
      });

      localStorage.setItem("firstname", firstname);
    }

    if (!isSignup) {
      await app.auth().signInWithEmailAndPassword(email, password);
      user = await app.auth().currentUser;

      users = await buglog.doc("LgJ4ax5SWZCeOSPj1GT4").get();
      // if (users.data()[user.uid]) {
      //
      // }
      userName = users.data()[user.uid].firstname;
      localStorage.setItem("firstname", userName);
    }

    const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
    localStorage.setItem("token", user.ma);
    localStorage.setItem("expirationDate", expirationDate);
    localStorage.setItem("userId", user.uid);

    dispatch(authSuccess(user.ma, user.uid, isSignup ? firstname : userName));
    dispatch(checkAuthTimeout());
  } catch (error) {
    dispatch(authFail(error));
  }
};

export const setAuthRedirectPath = path => {
  return { type: actionTypes.SET_AUTH_REDIRECT_PATH, path };
};

export const authCheckState = () => dispatch => {
  const token = localStorage.getItem("token");
  if (!token) {
    dispatch(logout());
  } else {
    const expirationDate = new Date(localStorage.getItem("expirationDate"));
    if (expirationDate <= new Date()) {
      dispatch(logout());
    } else {
      const userId = localStorage.getItem("userId");
      const firstname = localStorage.getItem("firstname");
      dispatch(authSuccess(token, userId, firstname));
      dispatch(
        checkAuthTimeout(
          (expirationDate.getTime() - new Date().getTime()) / 1000
        )
      );
    }
  }
};

export const fetchDataStart = () => {
  return { type: actionTypes.FETCH_DATA_START };
};

export const fetchDataSuccess = (type, data) => {
  return {
    type: actionTypes.FETCH_DATA_SUCCESS,
    payload: { name: type, [type]: data }
  };
};

export const fetchDataFail = error => {
  return { type: actionTypes.FETCH_DATA_FAIL, payload: { error } };
};

export const fetchData = type => async dispatch => {
  dispatch(fetchDataStart());
  try {
    let docId;
    const buglog = db.collection("buglog");
    switch (type) {
      case "users":
        docId = "LgJ4ax5SWZCeOSPj1GT4";
        break;
      case "projects":
        docId = "RePOycNjliCqKhGT8Con";
        break;
      case "roles":
        docId = "Tft8FVztOzchSQpGgyOi";
        break;
      case "ticketData":
        docId = "HyHPlzBWkqdl0k8TEZEt";
        break;
      case "tickets":
        docId = "t8sdCoSiwfF5qlV7okML";
        break;
      default:
        docId = null;
    }
    let items;

    items = await buglog.doc(docId).get();
    const finalData = {};
    for (let key in items.data()) {
      if (!items.data()[key].deleted) {
        finalData[key] = items.data()[key];
      }
    }
    dispatch(fetchDataSuccess(type, finalData));
  } catch (error) {
    dispatch(fetchDataFail(error));
  }
};

export const updateDataStart = () => {
  return { type: actionTypes.UPDATE_DATA_START };
};

export const updateDataSuccess = type => {
  return {
    type: actionTypes.UPDATE_DATA_SUCCESS,
    payload: { type }
  };
};

export const updateDataFail = error => {
  return { type: actionTypes.UPDATE_DATA_FAIL, payload: { error } };
};

export const updateData = (type, data, act) => async dispatch => {
  dispatch(updateDataStart());
  try {
    let docId;
    const buglog = db.collection("buglog");
    switch (type) {
      case "users":
        docId = "LgJ4ax5SWZCeOSPj1GT4";
        break;
      case "projects":
        docId = "RePOycNjliCqKhGT8Con";
        break;
      case "roles":
        docId = "Tft8FVztOzchSQpGgyOi";
        break;
      case "tickets":
        docId = "t8sdCoSiwfF5qlV7okML";
        break;
      default:
        docId = null;
    }

    const items = await buglog.doc(docId);
    if (!act) {
      await data.forEach(item => items.update({ [item.id]: item }));
    } else {
      if (data.length === 0) {
        items.set({});
      } else {
        let newObject = data.reduce((o, cur) => ({ ...o, [cur.id]: cur }), {});
        await items.set(newObject);
      }
    }

    dispatch(updateDataSuccess(type));
  } catch (error) {
    dispatch(updateDataFail(error));
  }
};
