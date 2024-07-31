import { BaseError } from './base-error'

export class BadRequest extends BaseError {
  constructor(message: string) {
    super(400, message)
  }
}
