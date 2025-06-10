import { createContext } from 'react'

export interface LikeContextType {
  liked: boolean
  toggleLike: (payload: boolean) => Promise<void>
  isLoading: boolean
}

export const LikeContext = createContext<LikeContextType>({
  liked: false,
  toggleLike: async () => {},
  isLoading: false,
})
