import { Component, OnInit } from '@angular/core';
import { products } from 'src/app/mocks/index';
@Component({
  selector: 'app-our-products',
  templateUrl: './our-products.component.html',
  styleUrls: ['./our-products.component.scss']
})
export class OurProductsComponent implements OnInit {

  productsList = products;
  activeTab = 0;
  categories: Set<string> = new Set();
  constructor() { }

  ngOnInit(): void {

    this.activeTab = 1;
  }

}
