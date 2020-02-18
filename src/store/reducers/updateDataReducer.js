import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../../shared/utility";

const initialState = {};

const updateDataStart = (state, action) => {
  return updateObject(state, { error: null, loading: true });
};

const updateDataSuccess = (state, action) => {
  return updateObject(state, {
    error: null,
    loading: false,
    type: action.payload.type
  });
};

const updateDataFail = (state, action) => {
  return updateObject(state, { error: action.payload.error, loading: false });
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.UPDATE_DATA_START:
      return updateDataStart(state, action);
    case actionTypes.UPDATE_DATA_SUCCESS:
      return updateDataSuccess(state, action);
    case actionTypes.UPDATE_DATA_FAIL:
      return updateDataFail(state, action);
    default:
      return state;
  }
};

export default reducer;
