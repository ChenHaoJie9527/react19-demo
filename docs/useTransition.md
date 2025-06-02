React useTransition 在 Tabs 大数据切换场景下的应用与优势
背景
在实际开发中，前端经常会遇到切换 Tab 时需要渲染大量数据的场景。例如，切换到“已完成”任务列表时，后端返回了 1000 条数据。此时如果直接更新列表，页面会出现明显的卡顿和延迟，尤其是在低性能设备或浏览器降速的情况下，用户体验会大打折扣。
React 18 引入的 useTransition 并发特性，正是为了解决这类高优先级交互与低优先级大数据渲染冲突的问题。
现象对比
1. 不使用 useTransition
切换 Tab 时，setTab 和 setTodos 都是同步高优先级更新。
渲染 1000 条数据会阻塞主线程，导致 UI 卡顿，点击反馈延迟。
用户体验差，切换 Tab 有明显延迟感。
2. 使用 useTransition
  setTab 依然是高优先级，但 setTodos 被标记为“过渡”更新。
  React 优先处理 Tab 切换的 UI（如按钮高亮、内容切换），等主线程空闲时再慢慢渲染 1000 条数据。
  用户感觉不到卡顿，交互体验极佳。
  代码示例

  ```tsx
  1. import { useState, useTransition } from 'react'
  
  const TabsGroup = () => {
    const [isPending, startTransition] = useTransition()
    const [tab, setTab] = useState('all')
    const [todos, setTodos] = useState([])
  
    // 获取数据
    const fetchTodos = async (type: string) => {
      const res = await fetch(`/api/list?type=${type}`)
      const data = await res.json()
      // 用 startTransition 包裹大数据渲染
      startTransition(() => {
        setTodos(data.data)
      })
    }
  
    // Tab 切换
    const handleTabChange = (value: string) => {
      setTab(value)
      fetchTodos(value)
    }
  
    return (
      <Tabs defaultValue={tab} onValueChange={handleTabChange}>
        {/* ...TabsList... */}
        <TabsContent value='completed'>
          {isPending ? (
            <div>Loading...</div>
          ) : (
            todos.map((todo) => <div key={todo.id}>{todo.title}</div>)
          )}
        </TabsContent>
        {/* ...其他内容... */}
      </Tabs>
    )
  }
  ```

  

那你看一下我当前这个组件

你的这个组件 TabsGroup 已经引入了 useTransition，并且有了 tab 状态和 todos 状态。你还写好了 fetchTodos 方法用于获取不同类型的 todo 列表。现在你只需要在 Tab 切换时，利用 startTransition 包裹你的数据请求和状态更新，这样切换 Tab 时就不会因为数据量大而卡顿。
你可以这样完善

```tsx
const handleTabChange = (value: string) => {
  setTab(value) // 先同步切换 tab 状态
  startTransition(() => {
    // 过渡性地拉取数据
    fetch(`/list?type=${value}`)
      .then(res => res.json())
      .then(data => setTodos(data.data))
  })
}
```

另外，建议在 tab 或组件初始化时拉取一次数据：

```tsx
import { useEffect } from 'react'
// ... 其他代码 ...

useEffect(() => {
  fetchTodos()
}, [tab])
```

这样可以保证每次 tab 变化时自动拉取数据。
你的 TabsContent 也可以渲染 todos：

```tsx
<TabsContent value='all'>
  {isPending && <div>加载中...</div>}

  <ul>
    {tab === 'all' && todos.map(todo => (
      <li key={todo.id}>{todo.title}</li>
    ))}
  </ul>

</TabsContent>
<TabsContent value='active'>
  {isPending && <div>加载中...</div>}

  <ul>
    {tab === 'active' && todos.map(todo => (
      <li key={todo.id}>{todo.title}</li>
    ))}
  </ul>

</TabsContent>
<TabsContent value='completed'>
  {isPending && <div>加载中...</div>}

  <ul>
    {tab === 'completed' && todos.map(todo => (
      <li key={todo.id}>{todo.title}</li>
    ))}
  </ul>

</TabsContent>
```

## 适用场景

- 切换 Tab 渲染大列表

- 搜索过滤大数据

- 路由切换加载大页面

- 复杂计算或异步请求