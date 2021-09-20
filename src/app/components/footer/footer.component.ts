import { Component, OnInit } from '@angular/core';
import {  faInstagram, faInstagramSquare  } from '@fortawesome/free-brands-svg-icons';
// import { faCoffee } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  faInstagram = faInstagram;
  faInstagramSquare = faInstagramSquare;
  constructor() { 

  }

  ngOnInit(): void {
  }

}
