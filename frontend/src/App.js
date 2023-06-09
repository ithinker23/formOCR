import FormMapper from "./pages/FormMapper";
import FormOCR from './pages/FormOCR'
import axios from 'axios'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'


const OCRAPI = axios.create({ baseURL: 'http://' + process.env.REACT_APP_OCRAPI_HOST + ':' + process.env.REACT_APP_OCRAPI_PORT + '' })

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<FormMapper OCRAPI={OCRAPI} />} />
        <Route path='/Client' element={<FormOCR OCRAPI={OCRAPI} />} />
      </Routes>
    </Router>
  );
}

export default App;
