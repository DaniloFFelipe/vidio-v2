import type { FastifyInstance } from 'fastify'

import { createProfile } from './create-profile'
import { deleteProfile } from './delete-profile'
import { getProfiles } from './get-profiles'
import { updateProfile } from './update-profile'

export async function profileRoutes(app: FastifyInstance) {
  app.register(createProfile)
  app.register(updateProfile)
  app.register(getProfiles)
  app.register(deleteProfile)
}
