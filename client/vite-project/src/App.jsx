import '@shopify/polaris/build/esm/styles.css';
import {AppProvider} from '@shopify/polaris';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import TimerManagerPage from './components/TimerPage';
// ...import your pages

function App() {
  return (
    <AppProvider i18n={{}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TimerManagerPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
export default App;