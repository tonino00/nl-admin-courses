import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import Routes from './pages/Routes'
import { store } from './store'

import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      </div>
    </Provider>
  );
}

export default App;
