import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MatSelect } from '@angular/material';
import { map } from "rxjs/operators";
import { Router } from '@angular/router';
import { LoginService } from "../../../metabol.auth/services";
import { AppSettings } from "../../../app";
import { DialogPathwayVisualizationComponent } from '../dialog-pathway-visualization';
import { DialogReactionResultsComponent } from '../dialog-reaction-results';

import * as _ from 'lodash';

@Component({
  selector: 'app-past-analysis-detail',
  templateUrl: './past-analysis-detail.component.html',
  styleUrls: ['./past-analysis-detail.component.css']
})
export class PastAnalysisDetailComponent implements OnInit {
  conTable: Array<[string,number]> = [];


  id;
  data;
  data2:JSON;
  idData;
  recDATA:JSON;
  selectedMethod;
  selectedObj=30;
  methods = {
    Metabolitics: '\d',
    DirectPathwayMapping: 'direct-pathway-mapping'
  };

  constructor(
    private http: HttpClient,
    private login: LoginService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {



    this.route.params.subscribe((params) => {
      this.id = params['key'];
      this.getData();
    //   // if (this.id === this.methods.DirectPathwayMapping) {
    //   //   this.getResult();
    //   // }
    //   if (this.isInteger(this.id)) {
    //     this.selectedObj = parseInt(this.id);
    //     this.getData();
    //   }
    //   else {
    //     this.router.navigate(['/past-analysis']);
    //   }
    });
  }

  getData() {
    this.selectedMethod = '0';
    let apiUrl = `${AppSettings.API_ENDPOINT}/analysis/detail/${this.id}`;
    this.http.get(apiUrl, this.login.optionByAuthorization())
      .subscribe((data: any) => {
        // console.log(data);
        this.data2 = JSON.parse(JSON.stringify(data['fold_changes']));

      for (let t in this.data2){
        this.conTable.push([t,this.data2[t]]);


      }
      //console.log(this.conTable);


        // this.conTable = data['fold_changes'] as JSON ;
        // console.log(this.conTable);

        // this.
        // Eliminating the pathways starting with 'Transport' and 'Exchange'
        this.data = data;
        let values = this.data['results_pathway'][0];
        let eliminated = {};
        let keys = _.keys(values)
          .filter(x => !x.startsWith('Transport') && !x.startsWith('Exchange'));
        keys.forEach(function (key) {
           eliminated[key] = values[key];
         });
         this.data['results_pathway'][0] = eliminated;
         console.log(data);
      });

      // console.log(typeof JSON.parse(this.data));
      // for (let t in this.data['fold_changes']){
      //   console.log(t);
      // }

      if (localStorage.getItem('reload') == 'True'){
        localStorage.removeItem('reload');
        location.reload();
      }
  }
  // getResult() {
  //   this.http.get(`${AppSettings.API_ENDPOINT}/analysis/direct-pathway-mapping`, this.login.optionByAuthorization())
  //     .subscribe((data: any) => {
  //       // console.log(data);
  //       // console.log(Object.keys(data['results_reaction'][0]).length);
  //       this.data = data;
  //     });
  //   this.selectedMethod = '1';
  //   // this.data = JSON.parse(localStorage.getItem('search-results'));
  //   // localStorage.removeItem('search-results');
  //   // //let histogram = JSON.parse(localStorage.getItem('histogram'));
  //   // //localStorage.removeItem('histogram');
  //   // //this.data['histogram'] = histogram;
  //   // let values = this.data['results_pathway'][0];
  //   // let eliminated = {};
  //   // let keys = _.keys(values)
  //   //   .filter(x => !x.startsWith('Transport') && !x.startsWith('Exchange'));
  //   // keys.forEach(function(key) {
  //   //   eliminated[key] = values[key];
  //   // });
  //   // this.searchResults = new Array(eliminated);
  // }
  isInteger(num) {
    try {
      return parseInt(num) ? true : false;
    }
    catch (err) {
      return false;
    }
  }
  reloadAnalysis () {
    //update the ui
    // console.log("Worked");
    // console.log(this.selectedObj);
    localStorage.setItem('reload', 'True');
    this.router.navigate(['/past-analysis', this.selectedObj]);

  }





}
