export class Patient {
  id: string;
  name: string;

  static builder() {
    return new PatientBuilder();
  }
}

export class PatientBuilder {
  private patient: Patient;

  constructor() {
    this.patient = new Patient();
  }

  withId(id: string): PatientBuilder {
    this.patient.id = id;
    return this;
  }

  withName(name: string): PatientBuilder {
    this.patient.name = name;
    return this;
  }

  build() {
    return this.patient;
  }
}
