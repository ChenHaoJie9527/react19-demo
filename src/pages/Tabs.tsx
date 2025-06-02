import { useState, useTransition } from 'react'
import TabLayout from '@/layouts/TabLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TabsGroup = () => {
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState('all')
  const [todos, setTodos] = useState<
    { id: number; title: string; completed: boolean }[]
  >([])

  const fetchTodos = async (type: string) => {
    const res = await fetch(`/api/list?type=${type}`)
    const data = await res.json()
    startTransition(() => {
      setTodos(data.data)
    })
    // setTodos(data.data)
  }

  const handleTabChange = (value: string) => {
    setTab(value)
    fetchTodos(value)
  }

  return (
    <TabLayout>
      <Tabs defaultValue={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value='all'>All</TabsTrigger>
          <TabsTrigger value='active'>Active</TabsTrigger>
          <TabsTrigger value='completed'>Completed</TabsTrigger>
        </TabsList>
        <TabsContent value='all'>
          {isPending ? (
            <div>Loading...</div>
          ) : (
            todos.map((todo) => <div key={todo.id}>{todo.title}</div>)
          )}
        </TabsContent>
        <TabsContent value='active'>
          {isPending ? (
            <div>Loading...</div>
          ) : (
            todos.map((todo) => <div key={todo.id}>{todo.title}</div>)
          )}
        </TabsContent>
        <TabsContent value='completed'>
          {isPending ? (
            <div>Loading...</div>
          ) : (
            todos.map((todo) => <div key={todo.id}>{todo.title}</div>)
          )}
        </TabsContent>
      </Tabs>
    </TabLayout>
  )
}

export default TabsGroup
