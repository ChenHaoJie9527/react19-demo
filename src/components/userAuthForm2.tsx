import { useActionState, useState } from 'react'
import { email, z } from 'zod/v4'

// 1. 定义表单校验 schema
const userAuthSchema = z.object({
  email: email({
    pattern: z.regexes.email,
  }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

// 1. 定义 schema
export const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      user: z.object({
        email: z.string(),
        password: z.string(),
      }),
    })
    .optional(),
})

// 2. 推导类型
export type LoginResponse = z.infer<typeof LoginResponseSchema>

// 3. 定义 useActionState 的 state 类型
interface ActionState {
  error?: string | Record<string, string[]>
  success?: boolean
  data?: {
    user: {
      email: string
      password: string
    }
  }
}

// 4. 表单校验函数
function validateLoginForm(
  formData: FormData
): { email: string; password: string } | { error: Record<string, string[]> } {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const result = userAuthSchema.safeParse({ email, password })
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }
  return { email, password }
}

// 5. 登录请求函数
async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const json = await res.json()
  // 校验接口返回格式
  const result = LoginResponseSchema.safeParse(json)
  if (!result?.data?.success) {
    return {
      success: false,
      message: result.data?.message || '',
    }
  }
  return result.data
}

export default function UserAuthForm2() {
  const [state, formAction, isPending] = useActionState(
    async (_state: ActionState, formData: FormData): Promise<ActionState> => {
      const validation = validateLoginForm(formData)
      if ('error' in validation) return { error: validation.error }
      const response = await loginRequest(
        validation.email as string,
        validation.password as string
      )
      // console.log('response===>', response.)
      if (!response.success) {
        return { error: response.message }
      }
      return { success: true, data: response.data }
    },
    {} as ActionState
  )

  // 新增：本地表单值和touched状态
  const [formValues, setFormValues] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({ email: false, password: false })

  // 校验整个表单
  const validation = userAuthSchema.safeParse(formValues)
  // 获取单个字段的错误
  const getFieldError = (field: 'email' | 'password') => {
    if (validation.success) return undefined
    return validation.error.flatten().fieldErrors[field]?.[0]
  }

  return (
    <form action={formAction} className='flex flex-col gap-2'>
      <input
        type='email'
        name='email'
        placeholder='Email'
        className='w-full rounded-md border border-gray-300 p-2'
        value={formValues.email}
        onChange={(e) =>
          setFormValues((v) => ({ ...v, email: e.target.value }))
        }
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
      />
      {touched.email && getFieldError('email') && (
        <div className='text-sm text-red-500'>{getFieldError('email')}</div>
      )}
      <input
        type='password'
        name='password'
        placeholder='Password'
        className='w-full rounded-md border border-gray-300 p-2'
        value={formValues.password}
        onChange={(e) =>
          setFormValues((v) => ({ ...v, password: e.target.value }))
        }
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
      />
      {touched.password && getFieldError('password') && (
        <div className='text-sm text-red-500'>{getFieldError('password')}</div>
      )}
      <button
        type='submit'
        disabled={isPending}
        className='w-full rounded-md border border-gray-300 p-2'
      >
        {isPending ? 'Loading...' : 'Login'}
      </button>
      {state.error && (
        <div className='text-center text-sm text-red-500'>
          {typeof state.error === 'string'
            ? state.error
            : Object.values(state.error).flat().join('、')}
        </div>
      )}
    </form>
  )
}
