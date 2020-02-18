import { combineReducers } from "redux";
import authReducer from "./authReducer";
import fetchDataReducer from "./fetchDataReducer";
import updateDataReducer from "./updateDataReducer";

export default combineReducers({
  auth: authReducer,
  fetchedData: fetchDataReducer,
  updatedData: updateDataReducer
});
