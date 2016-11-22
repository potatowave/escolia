import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

// Middlewares
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';  // set up logging in the console so we can see how actions are fired

// Actions
import { fetchCase } from './actions/api'


import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import App from './App.jsx';

// Load up the application styles
require('../styles/application.scss');

// Render the top-level React component

// Configure the Redux Store: .
// 'logger' middleware: this will console.log every action that is sent to the redux store.
const loggerMiddleware = createLogger()

const store = createStore(
  rootReducer,
  {},
  applyMiddleware(
    loggerMiddleware,
    thunkMiddleware
  )
);

// Wrap the component in a <Provider>
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('react-root')
);


// store.dispatch(fetchCase(1)).then(() =>
//   console.log(store.getState())
// )


const test_data = {
  "objectives": [
    {
      "id": 7,
      "case_id": 1,
      "name": "Cost",
      "sub_name": "Salary",
      "evaluation_objective": "Salary + benefits",
      "low_is_better": false,
      "order": 1,
      "unit_name": "Money",
      "unit_prefix": "$",
      "unit_suffix": null,
      "created_at": "2016-12-17T00:00:00.000Z",
      "updated_at": null
    },
    {
      "id": 8,
      "case_id": 1,
      "name": "Location",
      "sub_name": "Distance",
      "evaluation_objective": "Distance from home",
      "low_is_better": true,
      "order": 2,
      "unit_name": "Meters",
      "unit_prefix": null,
      "unit_suffix": "m",
      "created_at": "2016-12-17T00:00:00.000Z",
      "updated_at": null
    }
  ],
  "cases": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Jobs",
      "description": "This is a case for searching a developer job in vancouver",
      "created_at": null,
      "updated_at": null
    }
  ],
  "alternatives": [
    {
      "id": 1,
      "case_id": 1,
      "name": "LinkedIn",
      "image_url": "1",
      "order": null,
      "created_at": null,
      "updated_at": null
    },
    {
      "id": 2,
      "case_id": 1,
      "name": "Google",
      "image_url": "2",
      "order": null,
      "created_at": null,
      "updated_at": null
    },
    {
      "id": 3,
      "case_id": 1,
      "name": "LightHouse",
      "image_url": "3",
      "order": null,
      "created_at": null,
      "updated_at": null
    }
  ],
  "values": [
    {
      "alternative_id": 1,
      "objective_id": 7,
      "value": 120000,
      "id": 1,
      "case_id": 1,
      "name": "Facebook",
      "image_url": "1",
      "order": null,
      "created_at": null,
      "updated_at": null
    },
    {
      "alternative_id": 2,
      "objective_id": 7,
      "value": 150000,
      "id": 2,
      "case_id": 1,
      "name": "Google",
      "image_url": "2",
      "order": null,
      "created_at": null,
      "updated_at": null
    },
    {
      "alternative_id": 3,
      "objective_id": 7,
      "value": 95000,
      "id": 3,
      "case_id": 1,
      "name": "LightHouse",
      "image_url": "3",
      "order": null,
      "created_at": null,
      "updated_at": null
    },
    {
      "alternative_id": 1,
      "objective_id": 8,
      "value": 10,
      "id": 1,
      "case_id": 1,
      "name": "Facebook",
      "image_url": "1",
      "order": null,
      "created_at": null,
      "updated_at": null
    },
    {
      "alternative_id": 2,
      "objective_id": 8,
      "value": 25,
      "id": 2,
      "case_id": 1,
      "name": "Google",
      "image_url": "2",
      "order": null,
      "created_at": null,
      "updated_at": null
    },
    {
      "alternative_id": 3,
      "objective_id": 8,
      "value": 5,
      "id": 3,
      "case_id": 1,
      "name": "LightHouse",
      "image_url": "3",
      "order": null,
      "created_at": null,
      "updated_at": null
    }
  ],
  "uistate": 3
}

console.log("Loading data in the Store", test_data)
store.dispatch({type: 'DATA_LOADED', data: test_data})  // calls all your reducers

  // "uistate": {
  //   highlight: true,
  //   selected_alternative_id: 3
  // }
