import { Component, OnInit, ElementRef } from '@angular/core';
import {Router} from '@angular/router';
import { AppDataLoader } from '../../../metabol.common/services';
import * as _ from 'lodash';
import synonyms from '../../../assets/datasets/synonyms_latest.json';
import { filter } from 'lodash';

@Component({
  selector: 'search-bar',
  templateUrl: 'search-bar.component.html',
  styleUrls: ['search-bar.component.css'],
  host: {
    '(document:click)': 'handleClick($event)',
  },
})

export class SearchBarComponent {

  query: string;
  recon: any;
  filteredMetabolites = [];
  filteredReactions = [];
  filteredPathways = [];
  public synonymList: [] = synonyms;
  filteredSynonyms = [];

  constructor(private router: Router, private elementRef: ElementRef, private loader: AppDataLoader) { }

  search(query: string) {
    if (query)
      this.router.navigate(['/search-result', query]);
    this.generateFilters();
  }
  

  getSearch(query: string) {
    if (query)
    {
      this.loader.get('Recon3D', (recon) => {
        this.filteredReactions = _.values<any>(recon.reactions)
          .filter(x => x.id.startsWith(query) || x.name.startsWith(query));
        this.filteredMetabolites = _.values<any>(recon.metabolites)
          .filter(x => x.id.startsWith(query) || x.name.startsWith(query));
        this.filteredPathways = _.keys(recon.pathways)
          .filter(x => x.toLowerCase().startsWith(query.toLowerCase()));
        // let synonyms = [];
        // ['kegg', 'hmdb', 'pubChem', 'cheBI'].forEach(name => {
        //   let values = _.keys(this.mytest[name])
        //                 .filter(x => x.startsWith(query))
        //                 .map(y => this.mytest[name][y])
        //                 .filter(z => recon.metabolites[z]);
        //   let keys = [_.keys(this.mytest[name]).filter(x => x.startsWith(query)), values, name];
        //   synonyms.push(keys);
        //  });

        // let realNames = _.keys(this.synonymList)
        //         .filter(x => x.startsWith(query)).map(y => this.synonymList[y])
        //         .filter(z => recon.metabolites[z]);
        // const names = _.keys(this.synonymList)
        //               .filter(x => x.toLowerCase().startsWith(query.toLowerCase()))
        //               .map(y => console.log(y));
        // console.log(names);
        // realNames.forEach(metabolite => {
        //   let data = recon.metabolites[metabolite];
        //   data['id'] = synonyms[realNames.indexOf(metabolite)];
        //   this.filteredMetabolites.push(data);
        // })
        // synonyms.forEach(item => {
        //   item[1].forEach(metabolite => {
        //     let data = recon.metabolites[metabolite];
        //     data["id"] = "(" + item[2] + ") " + item[0][item[1].indexOf(metabolite)];
        //     this.filteredMetabolites.push(data);
        //   });
        // });
        // let realNames = _.keys(this.myvalues)
        //   .filter(x => x.startsWith(query)).map(y => this.myvalues[y])
        //   .filter(z => recon.metabolites[z]);
        // // console.log(realNames);
        // let synonyms = _.keys(this.myvalues)
        //   .filter(x => x.startsWith(query));
        // // console.log(synonyms);
        // realNames.forEach(metabolite => {
        //   let data = recon.metabolites[metabolite];
        //   // console.log(realNames.indexOf(metabolite));
        //   data["id"] = synonyms[realNames.indexOf(metabolite)];
        //   this.filteredMetabolites.push(data);
        // });
      });
    }
  }

  generateFilters() {
    this.filteredReactions = new Array<any>();
    this.filteredMetabolites = new Array<any>();
    this.filteredPathways = new Array<any>();
  }

  /**
   * Closes the autocomplete when click anywhere
   * @param  {[type]} event clickEvent
   */
  handleClick(event) {
    var clickedComponent = event.target;
    var inside = false;
    do {
      if (clickedComponent === this.elementRef.nativeElement)
        inside = true;
      clickedComponent = clickedComponent.parentNode;
    } while (clickedComponent);

    if (!inside) this.generateFilters();
  }

}
