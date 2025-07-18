import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import Routes from './pages/Routes'
import { store, persistor } from './store'
import ThemeProvider from './theme/ThemeProvider'

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <div className="App">
            <BrowserRouter>
              <Routes />
            </BrowserRouter>
          </div>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
