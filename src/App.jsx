import { Route, Routes } from 'react-router-dom'
import CanvasBoard from './components/CanvasBoard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<CanvasBoard />} />
      <Route path="/card/:id" element={<CanvasBoard />} />
    </Routes>
  )
}

export default App
