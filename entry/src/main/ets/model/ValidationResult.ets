// entry/src/main/ets/model/ValidationResult.ets
export class ValidationResult {
  isValid: boolean = false;
  message: string = '';

  constructor(isValid: boolean, message: string = '') {
    this.isValid = isValid;
    this.message = message;
  }
}