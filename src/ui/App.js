import React, { Suspense } from "react";
import { Provider } from "react-redux";
import ReduxToastr from "react-redux-toastr";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

import { I18nProvider } from "../_metronic/i18n";
import { LayoutSplashScreen, MaterialThemeProvider } from "../_metronic/layout";

import ErrorComponent from "./components/shared/toast";
import { Routes } from "./Routes";
import "react-redux-toastr/lib/css/react-redux-toastr.min.css";

const App = ({ basename, store, persistor }) => {
  return (
    <Provider store={store}>
      <ReduxToastr
        timeOut={6000}
        newestOnTop={false}
        preventDuplicates
        position="top-center"
        getState={(state) => state.toastr}
        transitionIn="fadeIn"
        transitionOut="fadeOut"
        showEasing="swing"
        closeOnToastrClick
      />
      <PersistGate persistor={persistor} loading={<LayoutSplashScreen />}>
        <Suspense fallback={<LayoutSplashScreen />}>
          <BrowserRouter basename={basename}>
            <MaterialThemeProvider>
              <I18nProvider>
                <ErrorComponent />
                <Routes />
              </I18nProvider>
            </MaterialThemeProvider>
          </BrowserRouter>
        </Suspense>
      </PersistGate>
    </Provider>
  );
};

export default App;