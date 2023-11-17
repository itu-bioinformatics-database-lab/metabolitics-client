import { element } from 'protractor';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import * as _ from 'lodash';

import { LoginService } from "../../../metabol.auth/services";
import { MetaboliteConcentration } from '../../models/metaboliteConcentration';
import { SubsystemAnalyzeService } from "../../services/subsystem-analyze/subsystem-analyze.service";
import { AppSettings } from '../../../app/';
import { NotificationsService } from 'angular2-notifications';
import { AppDataLoader } from '../../../metabol.common/services';
import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { HttpModule } from '@angular/http';
import { validate } from 'codelyzer/walkerFactory/walkerFn';
import { map } from 'rxjs/operators';
import synonyms from '../../../assets/datasets/synonyms_latest.json';

export interface Disease {
  id: number;
  name: string;
  synonym: string;
}

@Component({
  selector: 'concentration-table',
  templateUrl: 'concentration-table.component.html',
  styleUrls: ['concentration-table.component.css'],
  providers: [SubsystemAnalyzeService],
})
export class ConcentrationTableComponent implements OnInit {
  // Original name - change - recon_metabolite_name - recon_id
  @Input() conTable: Array<[string, number, string, string, boolean]> = [];
  myControl = new FormControl();
  analysisTable: Array<[string, number]> = [];
  previewTable: Array<[string, string, number]> = [];
  public synonymList: [] = synonyms;
  diseases: Disease[] = [];
  filteredOptions: Observable<Disease[]>;

  data;
  data2;
  data3;
  test: JSON;
  query: string;
  filteredDiseases = [];
  isMapped = true;
  synonymAdditions: Array<[string, number]> = [];

  form: FormGroup;
  analyzeName: FormControl;
  isPublic: FormControl;
  selectedMethod = 0;
  analyzeEmail: FormControl;
  Disease: FormControl;
  selected = 'Combined.json';

  unmappedMetabolites = [];

  comboboxMethods: Array<object> = [
    { id: 0, name: "Metabolitics" },
    { id: 1, name: "Direct Pathway Mapping" },
    { id: 2, name: "Pathway Enrichment"}
  ];
  methods = {
    Metabolitics: 0,
    DirectPathwayMapping: 1,
    MetaboliteEnrichment: 2
  };
  constructor(
    private fb: FormBuilder,
    private subSerivce: SubsystemAnalyzeService,
    private router: Router,
    public login: LoginService,
    private http: HttpClient,
    private notify: NotificationsService,
    private loader: AppDataLoader) { }

  ngOnInit() {
    this.http.get(`${AppSettings.API_ENDPOINT}/synonyms`)
        .subscribe((d:any) => {
          this.synonymList = d;
        });
    let dateTime = new Date().toLocaleString();
    console.log(this.conTable);
    this.unmappedMetabolites = this.conTable.filter((m) => {return m[4] == false;})
    this.form = this.createForm();
    this.analyzeName = new FormControl("My Analyze - " + dateTime, Validators.required);
    this.isPublic = new FormControl(true, Validators.required);
    this.analyzeEmail = new FormControl("Email", Validators.required);
    this.Disease = new FormControl("Disease/Condition", Validators.required);
    this.fetchDiseases();
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : (value.name + value.synonym)),
        map(name => name ? this._filter(name) : this.diseases.slice())
      );
  }
  fetchDiseases() {
    this.http.get(`${AppSettings.API_ENDPOINT}/diseases/all`, this.login.optionByAuthorization())

      // this.http.get(`http://127.0.0.1:5000/diseases/all`, this.login.optionByAuthorization())
      .subscribe((data: any) => {
        //console.log(data);
        data.forEach(element => {
          this.diseases.push({ id: element['id'], name: element['name'], synonym: element['synonym'] })
        });

        //this.diseases.push({name: 'abc', synonym:'x'})
      });
    // this.loader.get('diseases', (disease) => {
    //   let data = _.values<any>(disease);
    //   this.filteredDiseases = _.values<any>(data);
    //   console.log(_.values<any>(data));
    //   this.filteredDiseases.forEach(element => {
    //     this.diseases.push({name:element['name'], synonym: element['synonym'], id: element['name']});
    //   });
    // });
  }
  displayFn(disease?: Disease): string | undefined {
    return disease ? disease.name : undefined;
  }
  private _filter(name: string): Disease[] {
    const filterValue = name.toLowerCase();

    return this.diseases.filter(option => option.name.toLowerCase().indexOf(filterValue) === 0 || option.synonym.toLowerCase().indexOf(filterValue) === 0);
  }
  remove(index) {
    this.conTable.splice(index, 1);
  }

  createForm() {
    return this.fb.group({
      "name": ["", Validators.required],
      "value": ["", Validators.pattern('[0-9]+(\\.[0-9]+)?')]
    });
  }

  onSubmit(value) {
    // this.conTable.push([value['name'], parseInt(value['value'])]);
    // this.form = this.createForm();
    this.loader.get('Recon3D', (recon) => {
      if (recon.metabolites[value['name']]) {
        // tslint:disable-next-line:max-line-length
        this.conTable.push([value['name'], value['value'], recon.metabolites[value['name']].id, recon.metabolites[value['name']].name, true]);
        this.notify.success('Metabolite successfully added with matching', 'Success');
      } else {
        if (this.synonymList[value['name']]) {
          let name = this.prioritizeMetabolites(this.synonymList[value['name']]);
          if (recon.metabolites[name]){
            this.conTable.push([value['name'], value['value'], name, recon.metabolites[name].name, true]);
          } else {
            this.conTable.push([value['name'], value['value'], name, name, true]);
          }
          this.notify.success('Metabolite successfully added with matching', 'Success');
        } else {
          this.conTable.push([value['name'], value['value'], '-', '-', false]);
          this.notify.info("Metabolite successfully added but it has no matching", 'Info');
        }
      }
    });
    // let file = this.selected;
    // this.subSerivce.getJSON(file).subscribe(data => {
    //   this.data2 = data[value['name']];

    //   if (this.data2 === null || this.data2 === undefined || this.data2 === "" || this.data2.lenght === 0) {
    //     this.notify.error('Adding metabolite Failed', 'Check if you chosen the right DB ');

    //   } else {
    //     this.conTable.push([data[value['name']], value['value']]);
    //     this.form = this.createForm();
    //     this.notify.info('Metabolite Added', ' Sucess');
    //   }

    // });
    this.unmappedMetabolites = this.conTable.filter((m) => {return m[4] == false;})
  }

  analyze() {
    const selectedMethod = this.selectedMethod;
    this.conTable.forEach(metabolite => {
       if (metabolite[4]) {
         this.analysisTable.push([metabolite[2], metabolite[1]]);
       }
    });
    console.log(this.analysisTable);
    let data = {}
    if (localStorage.getItem('isMultiple') == 'True') {
      // assign the data came from API as data

    }
    else {
      let name = this.analyzeName.value;



      if (this.login.isLoggedIn()) {
        data = {
          "study_name": this.analyzeName.value,
          "public": this.isPublic.value,
          "analysis": { [name]: { "Metabolites": _.fromPairs(this.analysisTable), "Label": "not_provided" } },
          "group": "not_provided",
          "disease": this.myControl.value["id"]
        };
      }  // if


      else {
        data = {
          "study_name": this.analyzeName.value,
          "public": this.isPublic.value,
          "analysis": { [name]: { "Metabolites": _.fromPairs(this.analysisTable), "Label": "not_provided" } },
          "group": "not_provided",
          "disease": this.myControl.value["id"],
          "email": this.analyzeEmail.value
        };
      } // inner else


    }  // else
    // console.log(data);


    if (selectedMethod === this.methods.Metabolitics) {
      this.metabolitics(data);
    }
    else if (selectedMethod === this.methods.DirectPathwayMapping) {
      this.directPathwayMapping(data);
    }
    else if (selectedMethod === this.methods.MetaboliteEnrichment) {
      this.metaboliteEnrichment(data);
    }
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
  metabolitics(data) {

    if (this.login.isLoggedIn()) {

      this.http.post(`${AppSettings.API_ENDPOINT}/analysis/fva`,
        data, this.login.optionByAuthorization())
        .subscribe((data: any) => {
          this.notify.info('Analysis Start', 'Analysis in progress');
          this.router.navigate(['/past-analysis'])
          .then(() => {
            window.location.reload();
          });
        },
          error => {
            this.notify.error('Analysis Fail', error);
          });
    } // if
    else {
      this.http.post(`${AppSettings.API_ENDPOINT}/analysis/fva/public`,
        data)
        .subscribe((data: any) => {
          this.notify.info('Analysis Start', 'Results will be sent by email.');
          this.router.navigate(['/search']);
        },
          error => {
            this.notify.error('Analysis Fail', error);
          });

      // this.router.navigate(['/search']);

    }//else


  }



  directPathwayMapping(data) {

    if (this.login.isLoggedIn()) {
      this.http.post(`${AppSettings.API_ENDPOINT}/analysis/direct-pathway-mapping`,
        data, this.login.optionByAuthorization())
        .subscribe((data: any) => {
          this.notify.info('Analysis Start', 'Analysis in progress');
          this.notify.success('Analysis Done', 'Analysis is successfully done');
          this.router.navigate(['/past-analysis'])
          .then(() => {
            window.location.reload();
          });
        },
          error => {
            this.notify.error('Analysis Fail', error);
          });

      localStorage.setItem('search-results', JSON.stringify(data));
    } // if
    else {
      this.http.post(`${AppSettings.API_ENDPOINT}/analysis/direct-pathway-mapping/public`,
        data, this.login.optionByAuthorization())
        .subscribe((data: any) => {
          this.notify.info('Analysis Start', 'Analysis in progress');
          this.notify.success('Analysis Done', 'Analysis Results sent to your email');
          this.router.navigate(['/search']);
        },
          error => {
            this.notify.error('Analysis Fail', error);
          });

      localStorage.setItem('search-results', JSON.stringify(data));
      // this.router.navigate(['/search']);

    }// else

  }




  metaboliteEnrichment(data) {
    if (this.login.isLoggedIn()) {
      this.http.post(`${AppSettings.API_ENDPOINT}/analysis/pathway-enrichment`,
        data, this.login.optionByAuthorization())
        .subscribe((data: any) => {
          this.notify.info('Analysis Start', 'Analysis in progress');
          this.notify.success('Analysis Done', 'Analysis is successfully done');
          this.router.navigate(['/past-analysis'])
          .then(() => {
            window.location.reload();
          });
        },
          error => {
            this.notify.error('Analysis Fail', error);
          });

      localStorage.setItem('search-results', JSON.stringify(data));
    } // if
    else {
      this.http.post(`${AppSettings.API_ENDPOINT}/analysis/pathway-enrichment/public`,
        data, this.login.optionByAuthorization())
        .subscribe((data: any) => {
          this.notify.info('Analysis Start', 'Analysis in progress');
          this.notify.success('Analysis Done', 'Analysis Results sent to your email');
          this.router.navigate(['/search']);
        },
          error => {
            this.notify.error('Analysis Fail', error);
          });

      localStorage.setItem('search-results', JSON.stringify(data));
      // this.router.navigate(['/search']);

    }// else
  }
}
