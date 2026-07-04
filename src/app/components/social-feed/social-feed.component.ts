import { Variable } from '@angular/compiler/src/render3/r3_ast';
import { ChangeDetectorRef } from '@angular/core';
import { Renderer2, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Scale, Distance, Note } from "tonal";
import { Scale as TonalScale, Chord as TonalChord } from "@tonaljs/tonal";
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

  tunings: any = {
    standard: { label: 'Standard (EADGBe)', values: [4, 11, 7, 2, 9, 4] },
    openD:    { label: 'Open D (DADGAd)',   values: [2, 9, 6, 2, 9, 2] },
    openE:    { label: 'Open E (EBE G#Be)', values: [4, 11, 8, 4, 11, 4] },
    openG:    { label: 'Open G (DGDGBd)',   values: [2, 11, 7, 2, 7, 2] },
  };
  selectedTuning = 'standard';
  tuningKeys = Object.keys(this.tunings);
  guitarTuning = [4, 11, 7, 2, 9, 4];

  allNotes:any;
  showMultipleNotes = false;
  isArpeggio = false;
  showAllNoteNames = false;
  showDegrees = false;

  private readonly scaleLabels: { [k: string]: string } = {
    'ionian': 'Jónico', 'dorian': 'Dórico', 'phrygian': 'Frigio',
    'lydian': 'Lidio', 'mixolydian': 'Mixolidio', 'aeolian': 'Eólico',
    'locrian': 'Locrio', 'major pentatonic': 'Pent. Mayor',
    'minor pentatonic': 'Pent. Menor', 'major blues': 'Blues Mayor',
    'minor blues': 'Blues Menor', 'arp-major': 'Arp. Mayor',
    'arp-minor': 'Arp. Menor', 'arp-dom7': '7 Dominante',
    'arp-maj7': 'maj7 Mayor', 'arp-m7': '7b Menor',
  };

  getSelectionLabel(): string {
    return this.scaleLabels[this.currentScaleName] || this.currentScaleName || '';
  }

  toggleShowDegrees() {
    this.showDegrees = !this.showDegrees;
  }

  degreeHighlights: { [key: number]: boolean } = { 1: true, 3: false, 5: false, 7: false };
  readonly degreeColors: { [key: number]: string } = {
    1: '#c9a84c',
    3: '#10b981',
    5: '#818cf8',
    7: '#f472b6',
  };
  private readonly highlightClasses = ['note-show-root','note-show','note-degree-3','note-degree-5','note-degree-7'];


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



  changeTuning(tuningKey: string) {
    this.selectedTuning = tuningKey;
    this.guitarTuning = this.tunings[tuningKey].values;

    // Clear current fretboard DOM nodes (keep the fret numbers div)
    const fretboardEl = this.fretboard.nativeElement;
    const children = Array.from(fretboardEl.children) as HTMLElement[];
    children.forEach((child: HTMLElement) => {
      if (!child.id || child.id !== 'fretNumber') {
        this.renderer.removeChild(fretboardEl, child);
      }
    });

    this.setupFretBoard();

    if (this.showAllNoteNames) {
      const allNotes = document.querySelectorAll('.note-fret');
      allNotes.forEach((el: any) => {
        this.highlightClasses.forEach((c: string) => el.classList.remove(c));
        el.classList.add('note-show');
      });
    } else if (this.currentNote && this.currentScaleName) {
      this.getScales();
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

 toggleDegree(degree: number) {
    this.degreeHighlights[degree] = !this.degreeHighlights[degree];
    if (this.currentNote && this.currentScaleName) {
      this.getScales();
    }
  }

 setNote(noteName:any){
    this.currentNote = noteName;
    this.getScales();
 }

 getScalesName(scaleName:any){
  this.isArpeggio = false;
  this.currentScaleName = scaleName;
  this.getScales();
 }

 getArpeggioName(type: string) {
  this.isArpeggio = true;
  this.currentScaleName = type;
  this.getScales();
 }

 clearFretboard() {
    this.currentNote = undefined;
    this.currentScaleName = undefined;
    this.isArpeggio = false;
    this.showAllNoteNames = false;
    this.showDegrees = false;

    document.querySelectorAll('input[name="btnradio"], input[name="btnradionote"]')
      .forEach((r: any) => { r.checked = false; });

    const allNotes = document.querySelectorAll('.note-fret');
    allNotes.forEach((el: any) => {
      this.highlightClasses.forEach((c: string) => el.classList.remove(c));
      el.classList.add('note-hide');
      el.removeAttribute('data-degree');
    });

    this.socialFeedService.changeCurrentNote('');
    this.socialFeedService.changeCurrentScaleName('');
  }

  toggleAllNoteNames() {
    this.showAllNoteNames = !this.showAllNoteNames;
    const allNotes = document.querySelectorAll('.note-fret');

    if (this.showAllNoteNames) {
      allNotes.forEach((el: any) => {
        this.highlightClasses.forEach((c: string) => el.classList.remove(c));
        el.classList.add('note-show');
      });
    } else {
      allNotes.forEach((el: any) => {
        this.highlightClasses.forEach((c: string) => el.classList.remove(c));
        el.classList.add('note-hide');
      });
      if (this.currentNote && this.currentScaleName) {
        this.getScales();
      }
    }
  }

 getScales() {
    this.socialFeedService.changeCurrentNote(this.currentNote);
    this.socialFeedService.changeCurrentScaleName(this.currentScaleName);

    if (this.showAllNoteNames) return;
    if (this.currentNote == undefined || this.currentScaleName == undefined) return;

    this.allNotes = document.querySelectorAll('.note-fret');

    // Reset all visible note classes
    for (let i = 0; i < this.allNotes.length; i++) {
      const el = this.allNotes[i];
      this.highlightClasses.forEach(c => el.classList.remove(c));
      el.classList.add('note-hide');
      el.removeAttribute('data-degree');
    }

    // Build chroma → degree map
    const chromaToDegree = new Map<number, number>();

    if (this.isArpeggio) {
      const suffixes: { [k: string]: string } = {
        'arp-major': ' major', 'arp-minor': ' minor',
        'arp-dom7': '7', 'arp-maj7': 'maj7', 'arp-m7': 'm7',
      };
      const suffix = suffixes[this.currentScaleName];
      if (suffix !== undefined) {
        const chordData = TonalChord.get(this.currentNote + suffix);
        if (chordData.intervals && chordData.notes) {
          chordData.notes.forEach((noteName: string, i: number) => {
            const chroma = Note.chroma(noteName);
            const degree = parseInt(chordData.intervals[i]);
            if (chroma != null && !isNaN(degree)) chromaToDegree.set(chroma, degree);
          });
        }
      }
    } else {
      const scaleData = TonalScale.get(this.currentNote + ' ' + this.currentScaleName);
      if (scaleData.intervals && scaleData.notes) {
        scaleData.notes.forEach((noteName: string, i: number) => {
          const chroma = Note.chroma(noteName);
          const degree = parseInt(scaleData.intervals[i]);
          if (chroma != null && !isNaN(degree)) chromaToDegree.set(chroma, degree);
        });
      }
    }

    // Apply degree-specific classes
    for (let i = 0; i < this.allNotes.length; i++) {
      const el = this.allNotes[i];
      const noteChroma = Number(el.dataset['chroma']);

      if (!chromaToDegree.has(noteChroma)) continue;

      const degree = chromaToDegree.get(noteChroma)!;
      el.classList.remove('note-hide');
      el.setAttribute('data-degree', String(degree));

      if (degree === 1 && this.degreeHighlights[1]) {
        el.classList.add('note-show-root');
      } else if (degree === 3 && this.degreeHighlights[3]) {
        el.classList.add('note-degree-3');
      } else if (degree === 5 && this.degreeHighlights[5]) {
        el.classList.add('note-degree-5');
      } else if (degree === 7 && this.degreeHighlights[7]) {
        el.classList.add('note-degree-7');
      } else {
        el.classList.add('note-show');
      }
    }
  }



}
