import { BaseError } from './base-error'

export class Unauthorized extends BaseError {
  constructor(message: string = 'Unauthorized') {
    super(401, message)
  }
}
