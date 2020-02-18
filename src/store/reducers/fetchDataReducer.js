import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../../shared/utility";

const initialState = {};

const fetchDataStart = (state, action) => {
  return updateObject(state, { error: null, loading: true });
};

const fetchDataSuccess = (state, action) => {
  return updateObject(state, {
    [action.payload.name]: action.payload[action.payload.name],
    error: null,
    loading: false
  });
};

const fetchDataFail = (state, action) => {
  return updateObject(state, { error: action.payload.error, loading: false });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_DATA_START:
      return fetchDataStart(state, action);
    case actionTypes.FETCH_DATA_SUCCESS:
      return fetchDataSuccess(state, action);
    case actionTypes.FETCH_DATA_FAIL:
      return fetchDataFail(state, action);
    default:
      return state;
  }
};

export default reducer;
