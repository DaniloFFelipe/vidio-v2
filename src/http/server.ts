
import fastifyJwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { env } from '@/lib/env'
import { errorHandler } from '@/http/errors/handler'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { routes } from './routes'
import fastifyStatic from '@fastify/static'
import { join } from 'path'

const app = fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Vid.io Api',
      description: 'Api Docs',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(multipart)

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyStatic, {
  root: join(process.cwd(), 'public'),
  prefix: '/public',
})


app.register(routes)

const bootstrap = async () => {
  const server = await app.listen({
    port: env.SERVER_PORT,
    host: '0.0.0.0',
  })

  console.log('Server running on ', server)
}

bootstrap()

