import {
  type FastifyError,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify'
import { ZodError } from 'zod'

import { BaseError } from './base-error'

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  console.warn(error)
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BaseError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return reply.status(error.code as any).send({
      message: error.message,
    })
  }

  // send error to some observability platform
  return reply.status(500).send({ message: 'Internal server error' })
}
