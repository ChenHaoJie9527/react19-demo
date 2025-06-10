import { use } from 'react'
import { LikeContext } from '@/contexts/LikeContext'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { Button } from '@/components/ui/button'

const ErrorFallbackRender = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='text-2xl font-bold'>Error</div>
      <div className='text-sm text-gray-500'>{error.message}</div>
      <Button onClick={resetErrorBoundary}>Reset</Button>
    </div>
  )
}

const Like = () => {
  const { liked, toggleLike, isLoading } = use(LikeContext)
  return (
    <div className='bg-primary-foreground container grid h-svh max-w-none items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <ErrorBoundary
          fallbackRender={ErrorFallbackRender}
          onReset={(details) => {
            console.log(details)
          }}
        >
          <Button onClick={() => toggleLike(liked)} disabled={isLoading}>
            {liked ? '取消点赞' : '点赞'}
            {isLoading && '...'}
          </Button>
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default Like
