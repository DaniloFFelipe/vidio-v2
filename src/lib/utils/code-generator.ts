import { env } from '../env'

export function generateCode(length: number = 6): string {
  if (env.NODE_ENV === 'development') {
    return '111111'
  }

  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  const charsetLength = charset.length

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength)
    result += charset[randomIndex]
  }

  return result
}
