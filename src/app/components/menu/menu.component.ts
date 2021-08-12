import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  showMenu : boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

  toogleMenu(){
    console.log("Hwllo","GGG")
    this.showMenu = !this.showMenu;
  }

}
