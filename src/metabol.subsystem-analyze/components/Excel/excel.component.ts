import { Component, OnInit } from '@angular/core';
import {ConcentrationTableComponent} from '../concentration-table/concentration-table.component';
import {MetaboliteConcentration} from '../../models/metaboliteConcentration';
import { LoginService } from "../../../metabol.auth/services";
import {SignupService} from '../../../metabol.auth/services/signup/signup.service';
import {Router} from '@angular/router';
import {FormBuilder} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material';
import {MatDialogModule} from '@angular/material/dialog';
import {Subject} from 'rxjs/Subject';
import { AppSettings } from '../../../app/';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationsService } from 'angular2-notifications';
import { AppDataLoader } from '../../../metabol.common/services';
import { HttpClient } from '@angular/common/http';
import { SubsystemAnalyzeService } from "../../services/subsystem-analyze/subsystem-analyze.service";
import {Observable} from 'rxjs';
import {startWith} from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { Http, Headers, Response, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import synonyms from '../../../assets/datasets/synonyms_latest.json';

export interface Disease2 {
  id: number;
  name: string;
  synonym: string;
}

@Component({
  selector: 'app-manual',
  templateUrl: 'excel.component.html',
  styleUrls: ['excel.component.css'],
  providers: [SubsystemAnalyzeService],
})
export class ExcelComponent implements OnInit {


  usersData;
  usersData2;
  usersData3 = [];
  // keyys = []
  cases=[];
  labels=[];
  metaboliteNames=[];
  public synonymList: [] = synonyms;
  myControl = new FormControl();

  diseases: Disease2[]= [];
  filteredOptions: Observable<Disease2[]>;

  data;
  data2;
  data3;
  test: JSON;
  query: string;
  filteredDiseases=[];






  usersForm: FormGroup;

  form: FormGroup;
  analyzeName: FormControl;
  isPublic: FormControl;
  selectedMethod = 0;
  analyzeEmail: FormControl;
  Disease: FormControl;
  selected = 'Combined.json';


  comboboxMethods: Array<object> = [
    { id: 0, name: "Metabolitics" },
    { id: 1, name: "Direct Pathway Mapping" },
  ];
  methods = {
    Metabolitics: 0,
    DirectPathwayMapping: 1,
  };



  constructor(

    private fb: FormBuilder,
    private router: Router,
    public login: LoginService,
    private http: HttpClient,
    private notify: NotificationsService,
    // private http: Http,
    private loader: AppDataLoader
    ) {





  }

  ngOnInit(){


    this.form = this.createForm();
    this.analyzeName = new FormControl("My Analyze", Validators.required);
    this.isPublic = new FormControl(true, Validators.required);
    this.analyzeEmail = new FormControl("Email", Validators.required); //Disease
    this.Disease = new FormControl("Disease/Condition", Validators.required);
    this.fetchDiseases();
    this.filteredOptions = this.myControl.valueChanges
    .pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : (value.name + value.synonym)),
      map(name => name ? this._filter(name) : this.diseases.slice())
    );


    // this.selected = "option2";
    this.usersData = JSON.parse(localStorage.getItem('metabolitics-data'));
    this.usersData2 = this.usersData;
    for(let name in this.usersData2['analysis']){
      this.cases.push(name);
      this.labels.push(this.usersData2['analysis'][name]['Label']);
      // this.metaboliteValues.push(Object.entries(this.usersData2['analysis'][name]['Metabolites']));
    }
    for(let key in this.usersData2['analysis'][this.cases[0]]["Metabolites"]) {
    this.metaboliteNames.push(key); 
  }

    this.loader.get('recon2', (recon) => {
  for (var _i = 0; _i < this.metaboliteNames.length; _i++) {
    let temp_list = new Array();
    let temp_metabol_name;
    for (var _j = 0; _j < this.cases.length; _j++) {
      temp_metabol_name = this.metaboliteNames[_i];
      temp_list.push(this.usersData2['analysis'][this.cases[_j]]["Metabolites"][this.metaboliteNames[_i]]);
    }
    if (recon.metabolites[temp_metabol_name]) {
      temp_list.unshift(recon.metabolites[temp_metabol_name].id + " - (" + recon.metabolites[temp_metabol_name].name + ")");
    } else {
      if (this.synonymList[temp_metabol_name]) {
        const name = this.prioritizeMetabolites(this.synonymList[temp_metabol_name]);
        if (recon.metabolites[name]) {
          temp_list.unshift(recon.metabolites[name].id + " - (" + recon.metabolites[name].name + ")");
        } else {
          temp_list.unshift("- (-)");
        }
      } else {
        temp_list.unshift("- (-)");
      }
    }
    temp_list.unshift(temp_metabol_name);
    this.usersData3.push(temp_list);

}
  });
  


console.log(this.usersData3);




  localStorage.removeItem('metabolitics-data');


  }

    onSubmit() {
      // console.log("Analyse under Construction")

  

}
prioritizeMetabolites(metaboliteList) {
    let is_c_found = false;
    let is_m_found = false;
    let recon_name = "";
    metaboliteList.forEach(metabolite => {
      if (/_c/.test(metabolite) && !is_c_found) {
        recon_name = metabolite;
        is_c_found = true;
      }
    });
    if (!is_c_found) {
      metaboliteList.forEach(metabolite => {
        if (/_m/.test(metabolite) && !is_m_found) {
          recon_name = metabolite;
          is_m_found = true;
        }
      });
    }
    if (!is_c_found && !is_m_found) {
      const randomNumber = this.getRandomInt(0, metaboliteList.length - 1);
      recon_name = metaboliteList[randomNumber];
    }
    return recon_name;
  }
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

createForm() {
  return this.fb.group({
    "name": ["", Validators.required],
    "value": ["", Validators.pattern('[0-9]+(\\.[0-9]+)?')]
  });
}
fetchDiseases(){
  this.http.get(`${AppSettings.API_ENDPOINT}/diseases/all`, this.login.optionByAuthorization())
  .subscribe((data: any) => {
    //console.log(data);
    data.forEach(element => {
      this.diseases.push({id: element['id'], name: element['name'], synonym: element['synonym']})
    });
    //this.diseases.push({name: 'abc', synonym:'x'})
  });
}
displayFn(disease?: Disease2): string | undefined {
  return disease ? disease.name : undefined;
}
private _filter(name: string): Disease2[] {
  const filterValue = name.toLowerCase();

  return this.diseases.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0 || option.synonym.toLowerCase().indexOf(filterValue) ===0);
}

  analyze(){
    // console.log("Analyse under Construction")
    // this.router.navigateByUrl('/past-analysis-multi/123');

    const selectedMethod = this.selectedMethod;

    if (this.login.isLoggedIn()){
    this.usersData2['public'] = this.isPublic.value;
    this.usersData2['disease'] = this.myControl.value["id"];

    }

    else{
    this.usersData2['public'] = true;
    this.usersData2['disease'] = this.myControl.value["id"];
    this.usersData2['email'] = this.analyzeEmail.value;
    }



    if (selectedMethod === this.methods.Metabolitics) {
      this.metabolitics(this.usersData2);
    }
    else if(selectedMethod === this.methods.DirectPathwayMapping) {
      this.directPathwayMapping(this.usersData2);
    }

  }


  metabolitics(data) {

    if (this.login.isLoggedIn()){

    this.http.post(`${AppSettings.API_ENDPOINT}/analysis/fva`,
      data, this.login.optionByAuthorization())
      .subscribe((data: any) => {
        this.notify.info('Analysis Start', 'Analysis in progress');
        this.router.navigate(['/past-analysis', data['id']]);
      },
        error => {
          this.notify.error('Analysis Fail', error);
        });
  } // if 
  else{
    this.http.post(`${AppSettings.API_ENDPOINT}/analysis/fva/public`,
      data)
      .subscribe((data: any) => {
        this.notify.info('Analysis Start', 'Results will be sent by email.');
        this.router.navigate(['/search']);
      },
        error => {
          this.notify.error('Analysis Fail', error);
        });

  }//else 


  }


  directPathwayMapping(data) {

    if (this.login.isLoggedIn()){
      this.http.post(`${AppSettings.API_ENDPOINT}/analysis/direct-pathway-mapping`,
         data, this.login.optionByAuthorization())
         .subscribe((data:any) => {
           this.notify.info('Analysis Start', 'Analysis in progress');
           this.notify.success('Analysis Done', 'Analysis is successfully done');
           this.router.navigate(['/past-analysis', data['id']]);
         },
         error => {
         this.notify.error('Analysis Fail', error);
      });

    localStorage.setItem('search-results', JSON.stringify(data));
    
    } // if
else{
  this.http.post(`${AppSettings.API_ENDPOINT}/analysis/direct-pathway-mapping/public`,
  data, this.login.optionByAuthorization())
  .subscribe((data:any) => {
    this.notify.info('Analysis Start', 'Analysis in progress');
    this.notify.success('Analysis Done', 'Analysis Results sent to your email');
    this.router.navigate(['/search']);
  },
  error => {
  this.notify.error('Analysis Fail', error);
});
localStorage.setItem('search-results', JSON.stringify(data));


}// else 

  }


  }


