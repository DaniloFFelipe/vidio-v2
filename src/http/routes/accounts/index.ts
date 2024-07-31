import type { FastifyInstance } from 'fastify'

import { authenticateWithCode } from './authenticate-with-code'
import { createAccount } from './create-account'
import { requestAuthCode } from './request-auth-code'

export async function accountsRoutes(app: FastifyInstance) {
  app.register(createAccount)
  app.register(requestAuthCode)
  app.register(authenticateWithCode)
}
