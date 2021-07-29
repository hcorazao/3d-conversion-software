import { Injectable } from '@angular/core';
import { NgxXml2jsonService } from 'ngx-xml2json';
import { DentalCaseFolder } from '@app/models/dental-case-folder.model';

@Injectable({
  providedIn: 'root',
})
export class CaseXmlParserService {
  constructor(private ngxXml2jsonService: NgxXml2jsonService) {}

  parse(xmlText, caseName, xmlJsonToPatientDentalCase): DentalCaseFolder {
    try {
      const xml = new DOMParser().parseFromString(`${xmlText}`, 'text/xml');
      const json: any = this.ngxXml2jsonService.xmlToJson(xml);
      return xmlJsonToPatientDentalCase(json, caseName);
    } catch (error) {
      console.error(error);
      throw new Error('wrong xml format');
    }
  }
}
