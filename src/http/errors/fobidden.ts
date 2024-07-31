import { BaseError } from './base-error'

export class Forbidden extends BaseError {
  constructor(message: string = 'Forbidden') {
    super(401, message)
  }
}
