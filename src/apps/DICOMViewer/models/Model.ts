export class Model {
  fillProperties(config: any): void {
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) {
        (this as any)[key] = value;
      }
    }
  }

  checkMandatoryFieldsPresence(fields: string[]): void {
    for (const field of fields) {
      if ((this as any)[field] === undefined) {
        throw new Error(`Field ${field} is mandatory`);
      }
    }
  }
}
