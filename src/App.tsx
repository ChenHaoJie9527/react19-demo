import { lazy, createContext } from 'react'
import { z } from 'zod'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ContextMenuGroup from './pages/ContextMenu'
import Home from './pages/Home'
// import Tabs from './pages/Tabs'
import NotFound from './pages/NotFound'

const Login = lazy(() => import('./pages/Login'))
const Tabs = lazy(() => import('./pages/Tabs'))

export const AppSchema = z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
  }),
})

type AppState = z.infer<typeof AppSchema>

export const AppContext = createContext<AppState | null>(null)

function App() {
  return (
    <BrowserRouter>
      <AppContext
        value={{
          user: {
            name: 'test@example.com',
            email: 'test@example.com',
            password: '123123123',
          },
        }}
      >
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/tabs' element={<Tabs />} />
          <Route path='/context-menu' element={<ContextMenuGroup />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </AppContext>
    </BrowserRouter>
  )
}

export default App
