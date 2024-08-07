import { Component, ElementRef, OnChanges, Input} from '@angular/core';
import { AppDataLoader } from '../../../metabol.common/services';
import {EscherService} from '../../services';
import * as d3 from 'd3';
import * as _ from 'lodash';

@Component({
  selector: 'visualization-metabolite',
  templateUrl: 'metabolite-visualization.component.html',
  styleUrls: ['metabolite-visualization.component.css'],
})
export class MetaboliteVisualizationComponent implements OnChanges {

  @Input() id;

  constructor(
    private loader: AppDataLoader,
    private elementRef: ElementRef,
    private escher: EscherService) { }

  ngOnChanges() {
    this.loader.get('Recon3D', (recon) => {
      let element = d3.select(this.elementRef.nativeElement).select('#map_container_3');
      this.escher.buildMetaboliteMap(this.id, recon, element);
    });
  }

}
