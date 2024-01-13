import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material';
import { DialogPathwayVisualizationComponent } from '../dialog-pathway-visualization';
import { DialogReactionResultsComponent } from '../dialog-reaction-results';
import * as _ from 'lodash';


@Component({
  selector: 'result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.css']
})
export class ResultTableComponent implements OnInit, OnChanges {

  @Input() data;
  @Input() method: String;
  title;
  tableData;

  analysisNames: Array<string>;
  columns;
  constructor(private dialog: MatDialog) { }

  ngOnInit() { 
    if (this.method == 'Metabolitics') {
      this.title = 'Diff Score';
    }
    else if (this.method == 'Direct Pathway Mapping') {
      this.title = 'Mapping Score';
    }
    else if (this.method == 'Pathway Enrichment') {
      this.title = 'Enrichment P-Value';
    }
  }

  ngOnChanges() {
    //console.log(this.data[0].results_pathway[0]);

    let tableData = Object.keys(this.data[0].results_pathway[0])
      .map(x => ({ name: x }));



    this.columns = [{ name: 'Name' }];
    this.analysisNames = [];

    for (let i = 0; i < this.data.length; i++) {
      let analysisName = `${this.data[i].name}_${i}`;
      if (this.data.length == 1) {
        analysisName = "score";
      }
      this.columns.push({ prop: analysisName, comparator: this.scoreComparator.bind(this) });
      this.analysisNames.push(analysisName);
      for (let t of tableData)
        t[analysisName] = this.data[i].results_pathway[0][t.name];
    }
    this.tableData = tableData;
  }

  openReactionDialog(pathway, index) {
    let dialogRef = this.dialog.open(DialogReactionResultsComponent);
    dialogRef.componentInstance.pathway = pathway;
    dialogRef.componentInstance.fluxes = this.data[index].results_reaction[0];
  }

  openPathwayDialog(pathway, index) {
    let dialogRef = this.dialog.open(DialogPathwayVisualizationComponent, {
      width: '1000px',
    });
    let flux_dictionary = { 'reaction_data': this.data[0].results_reaction[0], 'fold_changes': this.data[0].fold_changes}
    dialogRef.componentInstance.pathway = pathway;
    dialogRef.componentInstance.fluxes = flux_dictionary;
  }

  scoreComparator(s1, s2) {
    return Math.abs(s1) > Math.abs(s2) ? 1 : -1;
  }

}
