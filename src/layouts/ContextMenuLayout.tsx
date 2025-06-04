const ContextMenuLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='bg-primary-foreground container h-svh max-w-none items-center justify-center'>
      <div className='mx-auto flex h-[400px] w-full flex-col overflow-x-hidden overflow-y-scroll rounded-md border p-4 md:w-[400px]'>
        {children}
      </div>
    </div>
  )
}

export default ContextMenuLayout
