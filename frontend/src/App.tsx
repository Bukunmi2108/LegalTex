import { Route, Routes } from 'react-router-dom'
import Editor from './pages/editor'
import Home from './pages/home'

const App = () => {
  return (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/editor" element={<Editor />} />
  </Routes>
  )
}

export default App