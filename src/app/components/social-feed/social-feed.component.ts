import { Variable } from '@angular/compiler/src/render3/r3_ast';
import { ChangeDetectorRef } from '@angular/core';
import { Renderer2, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Scale, Distance, Note } from "tonal";
import { SocialFeedService } from './social-feed.service';



@Component({
  selector: 'app-social-feed',
  templateUrl: './social-feed.component.html',
  styleUrls: ['./social-feed.component.scss']
})
export class SocialFeedComponent implements OnInit {

  root = document.documentElement;
  numbersOfFrets:any = 20;
  numberOfString:any = 6;
  singleFretMarkPositions = [3, 5, 7, 9, 15, 19, 21 ];
  doubleFretMarkPositions = [12,24];
  opacity:any = 0;
  shouldShow = true;
  fretsNumber:any = [];

  currentScaleName:any;
  currentNote:any;

  notesFlat = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
  notesSharp = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

  accidentals = 'flats';
  accidentals_sharps = 'sharps';

  guitarTuning = [4,11,7,2,9,4];

  allNotes:any;
  showMultipleNotes = false;


  @ViewChild('fretboard',{static:true}) fretboard:any;


  constructor(private cdr:ChangeDetectorRef,private renderer: Renderer2, private socialFeedService: SocialFeedService) {

    setTimeout(() => {

      this.cdr.detectChanges();
    });

   }

  ngOnInit(): void {
    this.generateNumberFrets();
    this.renderer.setProperty(this.root,'--notepacity',this.opacity);
    this.renderer.setProperty(this.root,'--number-of-strings',this.numberOfString);
    // this.root.style.setProperty('--number-of-strings',this.numberOfString);
    this.setupFretBoard();
    // this.setupEventListeners();



  }

  generateNumberFrets(){
    
    for (var _i = 0; _i <= this.numbersOfFrets; _i++) {
      this.fretsNumber.push(_i);
    }
  }



  setupFretBoard(){
      // this.renderer.setProperty(this.root,'note-dot-opacity',this.opacity);
      // this.root.style.setProperty('note-dot-opacity',this.opacity);

      // this.renderer.setStyle(this.root,'note-dot-opacity',this.opacity);
    //Add strings to fretboard
      for (let index = 0; index < this.numberOfString; index++) {
        var child = this.renderer.createElement('div');
        child.classList.add('string');
        this.renderer.appendChild(this.fretboard.nativeElement, child);



        //create frets
        for (let fret = 0; fret < this.numbersOfFrets; fret++) {
          var noteFret = this.renderer.createElement('div');
          noteFret.classList.add('note-fret');
          noteFret.classList.add('note-hide');

          var noteName = this.generateNoteNames((fret+this.guitarTuning[index]),this.accidentals_sharps);
          noteFret.setAttribute('data-note',noteName);
          noteFret.setAttribute('data-chroma',Note.chroma(noteName));
          noteFret.setAttribute('data-note-index',fret);

          //Add single fret marks
          if(index === 0 && this.singleFretMarkPositions.indexOf(fret) !== -1){
             noteFret.classList.add('single-fretmark');
          }

           //Add double fret marks
          if(index === 0 && this.doubleFretMarkPositions.indexOf(fret) !== -1){
            var doubleFretMark = this.renderer.createElement('div');
            doubleFretMark.classList.add('double-fretmark');
            noteFret.appendChild(doubleFretMark);
          }

          child.appendChild(noteFret);


        }
      }

  }

  generateNoteNames(noteIndex:any,accidentals:any) : string{
    noteIndex = noteIndex % 12;
    let noteName = "";

    if(accidentals === 'flats'){
        noteName= this.notesFlat[noteIndex];

    }else if (accidentals === 'sharps'){
      noteName= this.notesSharp[noteIndex];

    }
    return noteName;

  }

  setupEventListeners(){

    this.renderer.listen(this.fretboard.nativeElement, 'mouseover', (evt) => {
      if(evt.target.classList.contains('note-fret')){

          if(this.showMultipleNotes){
            this.toggleMultipleNotes( evt.target.dataset.note,1);
          }else{
            evt.target.classList.remove("note-hide");
            evt.target.classList.add("note-show");


          }
      }
    });

    this.renderer.listen(this.fretboard.nativeElement, 'mouseout', (evt) => {
      if(evt.target.classList.contains('note-fret')){


        if(this.showMultipleNotes ){
          this.toggleMultipleNotes( evt.target.dataset.note,0);
        }else{
          evt.target.classList.remove("note-show");
          evt.target.classList.add("note-hide");
        }
      }
    });

  }


  showAllNotes(event: any){
    if(event.target.checked){
      this.showMultipleNotes = !this.showMultipleNotes;

    }  else{
      this.showMultipleNotes = !this.showMultipleNotes;
    }
 }

  toggleMultipleNotes(noteName:any,opacity:any){
    this.allNotes = document.querySelectorAll('.note-fret');
    for (let index = 0; index < this.allNotes.length; index++) {
        if(this.allNotes[index].dataset.note === noteName){
          if(opacity ==1){
            // this.allNotes[index].style.setProperty('noteDotOpacity',opacity)
            this.allNotes[index].classList.remove("note-hide");
            this.allNotes[index].classList.add("note-show");
          }else{
            // this.allNotes[index].style.setProperty('noteDotOpacity',opacity)
            this.allNotes[index].classList.remove("note-show");
            this.allNotes[index].classList.add("note-hide");
          }

        }


    }
 }

 setNote(noteName:any){
    this.currentNote = noteName;
    this.getScales();
 }

 getScalesName(scaleName:any){

  this.currentScaleName = scaleName;
      this.getScales();

 }

 getScales(){
   // progression.fromRomanNumerals("C", ["IMaj7", "IIm7", "V7"]);
  //  this.socialFeedService.changeCurrentNoteAndScale(this.currentNote,this.currentScaleName);

    this.socialFeedService.changeCurrentNote(this.currentNote);
    this.socialFeedService.changeCurrentScaleName(this.currentScaleName);
  // console.log("Scale names.", Scale.names(false));
  // console.log("currentNote.",this.currentNote);
  // console.log("currentScaleName.",this.currentScaleName);
  // console.log("Scale names.",this.currentNote + " "+ this.currentScaleName);
    if(this.currentNote != undefined && this.currentScaleName != undefined){

      // console.log("Scale notes and name.",this.currentNote + " "+ this.currentScaleName);
      // console.log("Scale notes.", Scale.notes(this.currentNote + " "+ this.currentScaleName));
      this.allNotes = document.querySelectorAll('.note-fret');

      // for (var element of this.allNotes) {

      for (let index = 0; index < this.allNotes.length; index++) {

        if( this.allNotes[index].classList.contains('note-show')){
          this.allNotes[index].classList.remove("note-show");
          this.allNotes[index].classList.add("note-hide");
        }else if( this.allNotes[index].classList.contains('note-show-root')){
          this.allNotes[index].classList.remove("note-show-root");
          this.allNotes[index].classList.add("note-hide");
        }
      }


      for (let index = 0; index < this.allNotes.length; index++) {

        // console.log("scale", Scale.notes(this.currentNote + " "+ this.currentScaleName));
        Scale.notes(this.currentNote + " "+ this.currentScaleName).forEach((noteName, secondIndex) => {
          // console.log("Note.chroma",Note.chroma(noteName));
          // console.log("dataset.chroma",this.allNotes[index].dataset.chroma);
          if(Number(this.allNotes[index].dataset.chroma) === Note.chroma(noteName)){
            if(secondIndex == 0){
              this.allNotes[index].classList.add("note-show-root");
              this.allNotes[index].classList.remove("note-hide");
            }else{
              this.allNotes[index].classList.add("note-show");
              this.allNotes[index].classList.remove("note-hide");
            }

          }


       });

      }
    }


 }



}
