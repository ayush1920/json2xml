import { combineReducers } from "redux";
import errorNotifier from './errorNotifier'

const reducers = combineReducers(
    {
        errorNotifier: errorNotifier,
    }
);

export default reducers;