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

在 useTransition 的 startTransition(action) 函数中，action 指的是一个 回调函数（callback function）。

这个 action 函数的作用是：

包含非紧急的状态更新：你将那些你希望 React 在后台处理，而不会阻塞用户界面的状态更新逻辑放在这个 action 函数内部。
立即执行：startTransition 函数会立即调用你传入的 action 函数。
标记为 Transition：在 action 函数执行期间，所有同步触发的状态更新都会被 React 标记为“Transition”（过渡）。这意味着 React 会将这些更新视为非紧急的，可以被中断和推迟，以便更紧急的更新（例如用户输入）能够优先处理。
支持异步操作：从 React 19 开始，action 函数可以是异步的。这意味着你可以在 action 函数内部使用 await。但是，需要注意的是，在 await 之后的任何状态更新，如果也希望它们被标记为 Transition，仍然需要再次包装在另一个 startTransition 中。（这是一个目前已知的限制，未来可能会改进）。
可以包含副作用：除了状态更新，你也可以在 action 函数中执行副作用，例如数据获取等。这些副作用会在后台执行，不会阻塞主线程。
总结来说，action 就是一个函数，你告诉 React ：“嘿，这个函数里的所有状态更新都是不太紧急的，你可以先做其他重要的事，然后再来慢慢处理这些更新。”

```tsx
import React, { useState, useTransition } from 'react';

function SearchResults() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, startTransition] = useTransition(); // isSearching 是 useTransition 返回的 isPending 状态

  const handleChange = (event) => {
    // 紧急更新：立即更新输入框的显示
    setQuery(event.target.value);

    // 非紧急更新：在后台进行搜索，不阻塞UI
    startTransition(() => {
      // 模拟一个耗时的搜索操作
      const newResults = Array.from({ length: 1000 }, (_, i) => `Result for ${event.target.value} - ${i}`);
      setSearchResults(newResults);
    });
  };

  return (
    <div>
      <input type="text" value={query} onChange={handleChange} placeholder="Search..." />
      {isSearching && <p>Searching...</p>}
      <ul>
        {searchResults.map((result, index) => (
          <li key={index}>{result}</li>
        ))}
      </ul>
    </div>
  );
}
```

```tsx
import React, { useState, useTransition } from 'react';

function AsyncDataFetcher() {
  const [data, setData] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const fetchData = async () => {
    setLoadingMessage('Loading data...'); // 立即显示加载消息

    // 第一次 startTransition: 标记整个异步操作的开始为 Transition
    startTransition(async () => {
      console.log('Transition started before fetch.');
      // 模拟一个异步数据请求
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟网络延迟

      // --- !!! 关键点 !!! ---
      // 在 await 之后，我们已经脱离了最初的 startTransition 的同步执行范围。
      // 如果在这里直接调用 setData，这个更新将不会被视为 Transition，而是紧急更新。
      // 为了让 setData(newData) 也是 Transition，我们需要再次包装它。

      // 错误示范 (newData会是紧急更新):
      // const newData = "Fetched data (will be an urgent update)";
      // setData(newData); // 这会是紧急更新，可能会阻塞UI，不符合我们的Transition意图

      // 正确做法 (newData会是Transition):
      console.log('Entering second transition for final data update.');
      startTransition(() => { // 再次调用 startTransition 来确保 await 后的更新也是 Transition
        const newData = "Fetched data (this is a transition update)";
        setData(newData);
        setLoadingMessage('Data loaded!'); // 这个更新也是 Transition
      });
    });
  };

  return (
    <div>
      <button onClick={fetchData} disabled={isPending}>
        {isPending ? 'Fetching...' : 'Fetch Data'}
      </button>
      {loadingMessage && <p>{loadingMessage}</p>}
      {data && <p>Data: {data}</p>}
      <p>Is Pending (from useTransition): {isPending ? 'Yes' : 'No'}</p>
    </div>
  );
}

export default AsyncDataFetcher;
```



## 适用场景

- 切换 Tab 渲染大列表

- 搜索过滤大数据

- 路由切换加载大页面

- 复杂计算或异步请求