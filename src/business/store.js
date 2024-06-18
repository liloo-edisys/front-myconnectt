import { reduxBatch } from "@manaflair/redux-batch";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { rootReducer } from "reducers/rootReducer";
import { persistStore } from "redux-persist";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "sagas/rootSaga";

const sagaMiddleware = createSagaMiddleware();
const middleware = [
  ...getDefaultMiddleware({
    immutableCheck: false,
    serializableCheck: false,
    thunk: true
  }),
  sagaMiddleware
];

const store = configureStore({
  reducer: rootReducer,
  middleware,
  devTools: process.env.NODE_ENV !== "production",
  enhancers: [reduxBatch]
});

/**
 * @see https://github.com/rt2zz/redux-persist#persiststorestore-config-callback
 * @see https://github.com/rt2zz/redux-persist#persistor-object
 */
export const persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

export default store;
