// store.js
import { createStore } from 'redux';

// Action types
const LOGIN = 'LOGIN';

// Action creators
export const login = () => ({
  type: LOGIN,
});

// Reducer
const initialState = {
  isLoggedIn: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isLoggedIn: true,
      };
    default:
      return state;
  }
};

// Store
const store = createStore(reducer);

export default store;
