import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy } from 'react'
import Home from './pages/Home'
// import Tabs from './pages/Tabs'
import NotFound from './pages/NotFound'
import ContextMenuGroup from './pages/ContextMenu'

const Login = lazy(() => import('./pages/Login'))
const Tabs = lazy(() => import('./pages/Tabs'))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tabs" element={<Tabs />} />
        <Route path="/context-menu" element={<ContextMenuGroup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
