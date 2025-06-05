存在问题：

1. useActionState 与 react-hook-form不兼容

   - [x] action 的差异

     - React 19 的 <form action={actionFn}> 机制是为“服务器 action”或“客户端 action”设计的，直接把表单数据（FormData）传给 action。

     - react-hook-form 主要是用 onSubmit={form.handleSubmit(...)}，它会先做前端校验，然后把数据传给 handler。
     - 使用 <form action={formAction}> 时，react-hook-form 的校验和状态管理就“绕开”了，变成原生表单提交，react-hook-form 的 formState、errors、reset 等都无法自动工作。

     - 用 onSubmit={form.handleSubmit(formAction)} 又会导致 action 没有在 transition 里执行，isPending 不会正确更新，还会有警告。

       ```tex
       An async function with useActionState was called outside of a transition. This is likely not what you intended (for example, isPending will not update correctly). Either call the returned function inside startTransition, or pass it to an `action` or `formAction` prop
       ```

   - [x] 表单状态无法获取

     - 用 <form action={formAction}>，react-hook-form 的 formState、setError、reset、watch 等都无法自动响应 action 的结果。

     - 你只能用 action 的返回值（即 state）来显示错误或成功信息，但不能直接操作 react-hook-form 的状态。

   示例：

   ```tsx
   import type { HTMLAttributes } from 'react'
   import { useActionState } from 'react'
   import { z } from 'zod'
   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'
   import { cn } from '@/lib/utils'
   import { Button } from '@/components/ui/button'
   import {
     Form,
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
   } from '@/components/ui/form'
   import { Input } from '@/components/ui/input'
   import { PasswordInput } from '@/components/password-input'
   
   type UserAuthFormProps = HTMLAttributes<HTMLFormElement>
   
   const userAuthSchema = z.object({
     email: z
       .string()
       .min(1, { message: 'Please enter your email' })
       .email({ message: 'Invalid email address' }),
     password: z
       .string()
       .min(1, {
         message: 'Please enter your password',
       })
       .min(7, {
         message: 'Password must be at least 7 characters long',
       }),
   })
   
   async function handleLogin(data: z.infer<typeof userAuthSchema>) {
     try {
       const res = await fetch('/api/login', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           email: data.email,
           password: data.password,
         }),
       })
       const response = await res.json()
       return response
     } catch (error) {
       console.error(error)
       return { error: 'Invalid credentials' }
     }
   }
   
   export default function UserAuthForm({
     className,
     ...props
   }: UserAuthFormProps) {
     const [state, formAction, isPending] = useActionState(handleLogin, {})
     const form = useForm<z.infer<typeof userAuthSchema>>({
       resolver: zodResolver(userAuthSchema),
       defaultValues: {
         email: '',
         password: '',
       },
     })
   
     return (
       <Form {...form}>
         <form
           // submit 与 action 不符合，会导致不兼容
           onSubmit={form.handleSubmit(formAction)}
           className={cn('grid gap-3', className)}
           {...props}
         >
           <FormField
             control={form.control}
             name='email'
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Email</FormLabel>
                 <FormControl>
                   <Input placeholder='Email' {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <FormField
             control={form.control}
             name='password'
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Password</FormLabel>
                 <FormControl>
                   <PasswordInput placeholder='Password' {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <Button type='submit' className='w-full' loading={isPending}>
             Login
           </Button>
           {state?.error && (
             <div className="text-red-500 text-sm text-center">{state.error}</div>
           )}
         </form>
       </Form>
     )
   }
   ```

   解决思路

   1. 放弃 react-hook-form，使用原声表单 + action

      - 使用 <form action={formAction}>，所有校验都在 action 里做，校验使用 zod 

      - 完全兼容 React 19 新机制

      - 缺点：失去 react-hook-form 前端即时校验，表单状态管理

      - 原生表单 + action

        ```tsx
        import { useActionState } from 'react'
        import { z } from 'zod'
        
        const userAuthSchema = z.object({
          email: z.string().min(1, { message: '请输入邮箱' }).email({ message: '邮箱格式不正确' }),
          password: z.string().min(7, { message: '密码至少7位' }),
        })
        
        async function handleLogin(formData: FormData) {
          const data = {
            email: formData.get('email'),
            password: formData.get('password'),
          }
          const result = userAuthSchema.safeParse(data)
          if (!result.success) {
            return { error: result.error.errors[0].message }
          }
          // ...登录逻辑
        }
        
        export default function UserAuthForm() {
          const [state, formAction, isPending] = useActionState(handleLogin, {})
          return (
            <form action={formAction}>
              <input name="email" placeholder="Email" />
              <input name="password" type="password" placeholder="Password" />
              <button type="submit" disabled={isPending}>登录</button>
              {state?.error && <div>{state.error}</div>}
            </form>
          )
        }
        ```

      2. 只使用 react-hook-form 和 useTrantion

         ```tsx
         import type { HTMLAttributes } from 'react'
         import { useTransition, useState } from 'react'
         import { z } from 'zod'
         import { useForm } from 'react-hook-form'
         import { zodResolver } from '@hookform/resolvers/zod'
         import { cn } from '@/lib/utils'
         import { Button } from '@/components/ui/button'
         import {
           Form,
           FormControl,
           FormField,
           FormItem,
           FormLabel,
           FormMessage,
         } from '@/components/ui/form'
         import { Input } from '@/components/ui/input'
         import { PasswordInput } from '@/components/password-input'
         
         type UserAuthFormProps = HTMLAttributes<HTMLFormElement>
         
         const userAuthSchema = z.object({
           email: z
             .string()
             .min(1, { message: 'Please enter your email' })
             .email({ message: 'Invalid email address' }),
           password: z
             .string()
             .min(1, {
               message: 'Please enter your password',
             })
             .min(7, {
               message: 'Password must be at least 7 characters long',
             }),
         })
         
         export default function UserAuthForm({
           className,
           ...props
         }: UserAuthFormProps) {
           const [isPending, startTransition] = useTransition()
           const [error, setError] = useState('')
           const form = useForm<z.infer<typeof userAuthSchema>>({
             resolver: zodResolver(userAuthSchema),
             defaultValues: {
               email: '',
               password: '',
             },
           })
         
           const onSubmit = (data: z.infer<typeof userAuthSchema>) => {
             setError('')
             startTransition(async () => {
               const res = await fetch('/api/login', {
                 method: 'POST',
                 headers: {
                   'Content-Type': 'application/json',
                 },
                 body: JSON.stringify({
                   email: data.email,
                   password: data.password,
                 }),
               })
               const response = await res.json()
               if (!response.data && response.message) {
                 setError(response.message)
               }
             })
           }
         
         
           return (
             <Form {...form}>
               <form
                 onSubmit={form.handleSubmit(onSubmit)}
                 className={cn('grid gap-3', className)}
                 {...props}
               >
                 <FormField
                   control={form.control}
                   name='email'
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Email</FormLabel>
                       <FormControl>
                         <Input placeholder='Email' {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name='password'
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Password</FormLabel>
                       <FormControl>
                         <PasswordInput placeholder='Password' {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 
                 <Button type='submit' className='w-full' loading={isPending}>
                   Login
                 </Button>
                 {error && (
                   <div className="text-red-500 text-sm text-center">{error}</div>
                 )}
               </form>
             </Form>
           )
         }
         ```

         3. react 19  + 原生表单 + zod

            ### 优点

            - 与 useActionState、action 机制天然兼容，无缝支持 React 19 的新表单/异步流。

            - 表单数据自动通过 FormData 传递给 action，无需手动管理提交逻辑。

            - zod 校验可前后端复用，后端校验统一、类型安全。

            - 表单状态（如 loading、error）只需维护一份，通常直接用 action 的返回值（state）即可。

            - 更贴近 React 官方推荐的“表单即 action”范式，未来社区支持会更好。

            ### 缺点

            - 前端即时校验、错误提示、字段联动等需要手动实现（如 onBlur 校验、输入时清空错误等）。

            - 表单状态（如 dirty、touched、reset、watch）需要自己维护，没有 react-hook-form 那么丰富和自动。

            - 复杂表单（如动态字段、嵌套对象、数组）实现起来比 react-hook-form 繁琐。

         4. react-hook-form

            ### 优点

            - 前端校验体验极佳，支持 onChange/onBlur 校验、实时错误提示。

            - 表单状态管理丰富（dirty、touched、isValid、reset、watch 等）。

            - 复杂表单（如动态增减字段、嵌套对象、数组）支持好，API 友好。

            - 与 UI 库集成度高，社区生态成熟。

            ### 缺点

            - 与 React 19 的 action/useActionState 机制不兼容，只能用传统 onSubmit/fetch 方式。

            - 前后端校验逻辑容易分离，需手动同步。

            - 表单状态和错误需要自己和后端返回值做整合。

         5. 总结：

            1. React 19  + 原生表单 + zod，更轻量，状态管理集中，维护成本较低，适合简单的应用场景
            2. 复杂表单，表单前端校验交互多，推荐使用react-hook-form
            3. 使用zod处理表单校验，原生表单更容易集成

            