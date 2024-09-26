/**
 * Entry application component used to compose providers and render Routes.
 * */

import React from "react";

import { Provider } from "react-redux";
import ReduxToastr from "react-redux-toastr";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

import { I18nProvider } from "../_metronic/i18n";
import { LayoutSplashScreen, MaterialThemeProvider } from "../_metronic/layout";

import ErrorComponent from "./components/shared/toast";
import { Routes } from "./Routes";
import "react-redux-toastr/lib/css/react-redux-toastr.min.css";

import "react-redux-toastr/lib/css/react-redux-toastr.min.css";


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: ""
    };
  }

  render() {
    const { basename, store, persistor } = this.props;
    return (
      /* Provide Redux store */
      <Provider store={store}>
        <ReduxToastr
          timeOut={6000}
          newestOnTop={false}
          preventDuplicates
          position="top-center"
          getState={state => state.toastr} // This is the default
          transitionIn="fadeIn"
          transitionOut="fadeOut"
          showEasing="swing"
          closeOnToastrClick
        />
        {/* Asynchronously persist redux stores and show `SplashScreen` while it's loading. */}
        <PersistGate persistor={persistor} loading={<LayoutSplashScreen />}>
          {/* Add high level `Suspense` in case if was not handled inside the React tree. */}
          <React.Suspense fallback={<LayoutSplashScreen />}>
            {/* Override `basename` (e.g: `homepage` in `package.json`) */}
            <BrowserRouter basename={basename}>
              {/*This library only returns the location that has been active before the recent location change in the current window lifetime.*/}
              <MaterialThemeProvider>
                {/* Provide `react-intl` context synchronized with Redux state.  */}
                <I18nProvider>
                  <ErrorComponent />

                  {/* Render routes with provided `Layout`. */}
                  <Routes />
                </I18nProvider>
              </MaterialThemeProvider>
            </BrowserRouter>
          </React.Suspense>
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
