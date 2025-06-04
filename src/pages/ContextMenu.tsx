import ContextMenuLayout from '@/layouts/ContextMenuLayout'
import { ContextMenu as BaseContextMenu } from '@base-ui-components/react/context-menu'
// import {
//   ContextMenu,
//   ContextMenuContent,
//   ContextMenuItem,
//   ContextMenuTrigger,
// } from '@/components/ui/context-menu'

const list = [
  {
    id: 1,
    content: 'Item 1',
    name: '玩家1',
  },
  {
    id: 2,
    content: 'Item 2',
    name: '玩家2',
  },
  {
    id: 3,
    content: 'Item 3',
    name: '玩家3',
  },
  {
    id: 4,
    content: 'Item 4',
    name: '玩家4',
  },
  {
    id: 5,
    content: 'Item 5',
    name: '玩家5',
  },
  {
    id: 6,
    content: 'Item 6',
    name: '玩家6',
  },
  {
    id: 7,
    content: 'Item 7',
    name: '玩家7',
  },
  {
    id: 8,
    content: 'Item 8',
    name: '玩家8',
  },
  {
    id: 9,
    content: 'Item 9',
    name: '玩家9',
  },
  {
    id: 10,
    content: 'Item 10',
    name: '玩家10',
  },
  {
    id: 11,
    content: 'Item 11',
    name: '玩家11',
  },
  {
    id: 12,
    content: 'Item 12',
    name: '玩家12',
  },
  {
    id: 13,
    content: 'Item 13',
    name: '玩家13',
  },
  {
    id: 14,
    content: 'Item 14',
    name: '玩家14',
  },
  {
    id: 15,
    content: 'Item 15',
    name: '玩家15',
  },
  {
    id: 16,
    content: 'Item 16',
    name: '玩家16',
  },
]

const CustomContextMenu = ({
  children,
  item,
  onAction,
}: {
  children: React.ReactNode
  item: { name: string; content: string }
  onAction: (action: string, item: { name: string; content: string }) => void
}) => (
  //   <ContextMenu>
  //     <ContextMenuTrigger asChild>
  //       {children}
  //     </ContextMenuTrigger>
  //     <ContextMenuContent>
  //       <ContextMenuItem onClick={() => onAction('edit', item)}>编辑 {item.name}</ContextMenuItem>
  //       <ContextMenuItem onClick={() => onAction('delete', item)}>删除 {item.name}</ContextMenuItem>
  //       {/* 你可以根据 item 动态渲染更多内容 */}
  //     </ContextMenuContent>
  //   </ContextMenu>
  <BaseContextMenu.Root>
    <BaseContextMenu.Trigger>{children}</BaseContextMenu.Trigger>
    <BaseContextMenu.Portal>
      <BaseContextMenu.Positioner className='outline-none'>
        <BaseContextMenu.Popup>
          <BaseContextMenu.Item onClick={() => onAction('edit', item)}>
            <div>编辑 {item.name}</div>
          </BaseContextMenu.Item>
          <BaseContextMenu.Item onClick={() => onAction('delete', item)}>
            <div>删除 {item.name}</div>
          </BaseContextMenu.Item>
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  </BaseContextMenu.Root>
)

const ContextMenuGroup = () => {
  const handleMenuAction = (
    action: string,
    item: { name: string; content: string }
  ) => {
    if (action === 'edit') {
      // 编辑逻辑
      alert(`编辑: ${item.name || item.content}`)
    } else if (action === 'delete') {
      // 删除逻辑
      alert(`删除: ${item.name || item.content}`)
    }
  }

  return (
    <ContextMenuLayout>
      {list.map((item) => (
        <CustomContextMenu
          key={item.id}
          item={item}
          onAction={handleMenuAction}
        >
          <div className='flex h-10 w-full cursor-pointer items-center gap-2 border-b py-4'>
            <span>{item.name}</span>
            <span>{item.content}</span>
          </div>
        </CustomContextMenu>
      ))}
    </ContextMenuLayout>
  )
}

export default ContextMenuGroup
