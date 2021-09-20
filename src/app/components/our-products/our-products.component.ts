import { Component, Input, OnInit } from '@angular/core';
import { products } from 'src/app/mocks/index';
import progressions from 'src/app/mocks/progressions';
import { Progression } from "@tonaljs/tonal";
import { SocialFeedComponent } from '../social-feed/social-feed.component';
import { SocialFeedService } from '../social-feed/social-feed.service';


@Component({
  selector: 'app-our-products',
  templateUrl: './our-products.component.html',
  styleUrls: ['./our-products.component.scss']
})
export class OurProductsComponent implements OnInit {


  productsList = products;
  activeTab = 0;
  categories: Set<string> = new Set();
  progressionsListOriginal = JSON.parse(JSON.stringify(progressions));
  progressionsList = JSON.parse(JSON.stringify(progressions));

  current_Note:string = "";
  current_ScaleName:string = "";
  arrayScale: Array<string> = [];
  current_scale_index = 0;

  constructor(private socialFeedService:SocialFeedService) {
   
   }

  ngOnInit(): void {
    
    this.activeTab = 1; 
  
    this.socialFeedService.currentNote.subscribe(currentNote =>{
      console.log("111111111" )
      this.current_Note = currentNote;
      this.arrayScale = [];
      this.setScaleAndNote();
    });

    this.socialFeedService.currentScaleName.subscribe(currentScaleName =>{
      console.log("2222222" )
      this.current_ScaleName = currentScaleName;
      this.arrayScale = [];
      this.setScaleAndNote();
    });
   
  }

  setScaleAndNote(){

    console.log("current_ScaleName-zz",this.current_ScaleName )
    console.log("current_Note-zz",this.current_Note)
    
    console.log("progressionsList",this.progressionsList)
    console.log("progressionsListOriginal",this.progressionsListOriginal)
    this.progressionsList = JSON.parse(JSON.stringify(progressions));
    if(this.current_ScaleName!= "" && this.current_ScaleName != undefined
     && this.current_Note != "" && this.current_Note != undefined){
      console.log("entro setScaleAndNote");
      this.progressionsList.forEach((value:any, index:any) => {

        // console.log("this.current_ScaleName",this.current_ScaleName);
        // console.log("this.name",value.name);

        if(value.name == this.current_ScaleName){
          this.current_scale_index = index;

          value.roman_1 = this.progressionsListOriginal[index].roman_1
          value.roman_2 = this.progressionsListOriginal[index].roman_2
          value.roman_3 = this.progressionsListOriginal[index].roman_3
          value.roman_4 = this.progressionsListOriginal[index].roman_4
          value.roman_5 = this.progressionsListOriginal[index].roman_5
          value.roman_6 = this.progressionsListOriginal[index].roman_6
          value.roman_7 = this.progressionsListOriginal[index].roman_7

          this.arrayScale.push(value.roman_1);
          this.arrayScale.push(value.roman_2)
          this.arrayScale.push(value.roman_3)
          this.arrayScale.push(value.roman_4)
          this.arrayScale.push(value.roman_5)
          this.arrayScale.push(value.roman_6)
          this.arrayScale.push(value.roman_7)                           
          console.log("romanToNumerals this.current_Note",this.current_Note);
          console.log("romanToNumerals this.arrayScale",this.arrayScale);
          var romanToNumerals =  Progression.fromRomanNumerals(this.current_Note, this.arrayScale);
          console.log("romanToNumerals",romanToNumerals);
          value.roman_1 = romanToNumerals[0];
          value.roman_2 = romanToNumerals[1];
          value.roman_3 = romanToNumerals[2];
          value.roman_4 = romanToNumerals[3];
          value.roman_5 = romanToNumerals[4];
          value.roman_6 = romanToNumerals[5];
          value.roman_7 = romanToNumerals[6];

        }       
     });
      // this.progressionsList.
     
      // console.log("fromRomanNumerals",Progression.fromRomanNumerals(this.current_Note,this.arrayScale));
    }

  }

}
