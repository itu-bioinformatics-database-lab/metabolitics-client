import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { AppDataLoader } from '../../../metabol.common/services';
import * as _ from 'lodash';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-search-result',
  templateUrl: 'search-result.component.html',
  styleUrls: ['search-result.component.css'],
})
export class SearchResultComponent implements OnInit {
  query: string;
  filteredMetabolites: Array<any>;
  filteredReactions: Array<any>;
  filteredPathways: Array<any>;

  constructor(private route: ActivatedRoute, private loader: AppDataLoader, private http: HttpClient) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loader.get('Recon3D', (recon) => {
        // this.filteredReactions = this.filter(recon.reactions, params['query']);
        // this.filteredMetabolites = this.filter(recon.metabolites, params['query']);
        // this.filteredPathways = this.filter(recon.pathways, params['query']);
        const query = params['query'];
        this.filteredReactions = _.values<any>(recon.reactions)
          .filter(x => x.id.startsWith(query) || x.name.startsWith(query));
        this.filteredPathways = _.keys(recon.pathways)
          .filter(x => x.startsWith(query));
        /*this.filteredMetabolites = _.values<any>(recon.metabolites)
          .filter(x => x.id.startsWith(query) || x.name.startsWith(query));*/
        
      });

      const queryLower = params['query'].toLowerCase();

      this.http.get<any>('assets/datasets/synonyms_latest.json').subscribe((synonym: Record<string, string[]>) => {
        const matchedEntries = Object.entries(synonym)
          .filter(([name, ids]: [string, string[]]) => 
            name.toLowerCase().startsWith(queryLower) || 
            ids.some(id => id.toLowerCase().startsWith(queryLower))
          );

        if (matchedEntries.length > 0) {
          const matchedNames = matchedEntries.map(([name, _]) => name);
          
          const idSet = new Set<string>();
          matchedEntries.forEach(([_, ids]) => {
            (ids as string[]).forEach(id => idSet.add(id));
          });

          const matchedIds = Array.from(idSet);

          //console.log('Matched Names:', matchedNames);
          //console.log('Matched IDs:', matchedIds);

          this.loader.get('Recon3D', (recon) => {
            this.filteredMetabolites = matchedIds
              .map(id => recon.metabolites[id]) 
              .filter(metabolite => metabolite) 
              .map(metabolite => ({ name: metabolite.name, id: metabolite.id })); 

            //console.log('Filtered Metabolites:', this.filteredMetabolites);
          });
        } else {
          this.filteredMetabolites = [];
          console.log('No matches found');
        }
      });
    });

  }

  /*filter(metaboliteReaction, query) {
    return _.values<any>(metaboliteReaction)
      .filter(x => x.id.startsWith(query) || x.name.startsWith(query));
  }*/

}
