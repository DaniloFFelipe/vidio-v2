import { BaseError } from './base-error'

export class NotFound extends BaseError {
  constructor(message: string = 'Resource not found') {
    super(401, message)
  }
}
