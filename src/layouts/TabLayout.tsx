import { Card, CardContent } from '@/components/ui/card'

const TabLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='bg-primary-foreground container h-svh max-w-none items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 md:w-3xl md:p-8'>
        <Card className='gap-4'>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TabLayout
