import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-case-detail-line',
  templateUrl: './case-detail-line.component.html',
  styleUrls: ['./case-detail-line.component.scss'],
})
export class CaseDetailLineComponent implements OnInit {
  @Input() label: string;
  @Input() value: string;

  constructor() {}

  ngOnInit(): void {}
}
