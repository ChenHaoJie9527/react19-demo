import { lazy, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import { AppContext } from './contexts/AppContext'
import { LikeContext } from './contexts/LikeContext'
import ContextMenuGroup from './pages/ContextMenu'
import Home from './pages/Home'
import Like from './pages/Like'
// import Tabs from './pages/Tabs'
import NotFound from './pages/NotFound'

const Login = lazy(() => import('./pages/Login'))
const Tabs = lazy(() => import('./pages/Tabs'))

function App() {
  const [liked, setLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const toggleLike = async (payload: boolean) => {
    setIsLoading(true)
    try {
      // 这里可以根据实际接口调整
      const response = await fetch('http://localhost:3001/like', {
        method: 'POST',
        body: JSON.stringify({ liked: payload }),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const data = await response.json()
      console.log('data===>', data)
      if (data.success) {
        setLiked(data.data.liked)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BrowserRouter>
      {/* <AppContext
        value={{
          user: {
            name: 'test@example.com',
            email: 'test@example.com',
            password: '123123123',
          },
        }}
      > */}
        <LikeContext.Provider value={{ liked, toggleLike, isLoading }}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/tabs' element={<Tabs />} />
            <Route path='/context-menu' element={<ContextMenuGroup />} />
            <Route path='/like' element={<Like />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </LikeContext.Provider>
      {/* </AppContext> */}
    </BrowserRouter>
  )
}

export default App
