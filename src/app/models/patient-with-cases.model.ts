import { DentalCaseSimple } from './dental-case-simple.model';
import { Patient } from './patient.model';

export class PatientWithCases {
  patient: Patient;
  dentalCaseSimples: DentalCaseSimple[];

  static builder() {
    return new PatientWithCasesBuilder();
  }
}

export class PatientWithCasesBuilder {
  private patientWithCases: PatientWithCases;

  constructor() {
    this.patientWithCases = new PatientWithCases();
  }

  withPatient(patient: Patient): PatientWithCasesBuilder {
    this.patientWithCases.patient = patient;
    return this;
  }

  withCases(cases: DentalCaseSimple[]): PatientWithCasesBuilder {
    this.patientWithCases.dentalCaseSimples = cases;
    return this;
  }

  build() {
    return this.patientWithCases;
  }
}
