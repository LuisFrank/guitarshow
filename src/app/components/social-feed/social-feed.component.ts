import { Variable } from '@angular/compiler/src/render3/r3_ast';
import { ChangeDetectorRef } from '@angular/core';
import { Renderer2, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Scale, Distance, Note } from "tonal";
import { Scale as TonalScale, Chord as TonalChord, Progression } from "@tonaljs/tonal";
import { SocialFeedService } from './social-feed.service';
import progressions from '../../mocks/progressions';

interface ChordDiagram {
  positionLabel: string;
  markers: string[];
  grid: (({ degree: number } | null)[])[];
  stringLabels: string[];
}



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
    standard: { label: 'Standard (E-A-D-G-B-e)', values: [4, 11, 7, 2, 9, 4] },
    openD:    { label: 'Open D (D-A-D-F#-A-d)',  values: [2, 9, 6, 2, 9, 2] },
    openE:    { label: 'Open E (E-B-E-G#-B-e)',  values: [4, 11, 8, 4, 11, 4] },
    openG:    { label: 'Open G (D-G-D-G-B-d)',   values: [2, 11, 7, 2, 7, 2] },
  };
  selectedTuning = 'standard';
  tuningKeys = Object.keys(this.tunings);
  guitarTuning = [4, 11, 7, 2, 9, 4];

  progressionRomanLabels = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  progressionChordNames: string[] = [];
  isProgressionChord = false;
  currentChordName: string | undefined;
  currentDegree: number | undefined;

  chordDiagrams: ChordDiagram[] = [];
  chordDiagramLabel = '';

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

  degreeHighlights: { [key: number]: boolean } = { 1: false, 3: false, 5: false, 7: false };
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
    this.updateProgressionChordNames();
    this.getScales();
 }

 getScalesName(scaleName:any){
  this.isArpeggio = false;
  this.currentScaleName = scaleName;
  this.isProgressionChord = false;
  this.currentChordName = undefined;
  this.currentDegree = undefined;
  this.updateProgressionChordNames();
  this.getScales();
 }

 getArpeggioName(type: string) {
  this.isArpeggio = true;
  this.currentScaleName = type;
  this.progressionChordNames = [];
  this.isProgressionChord = false;
  this.currentChordName = undefined;
  this.currentDegree = undefined;
  this.chordDiagrams = [];
  this.getScales();
 }

 updateProgressionChordNames() {
    this.progressionChordNames = [];
    if (this.isArpeggio || !this.currentNote || !this.currentScaleName) return;

    const row: any = progressions.find((p: any) => p.name === this.currentScaleName);
    if (!row) return;

    const romans = [
      row.roman_1, row.roman_2, row.roman_3,
      row.roman_4, row.roman_5, row.roman_6, row.roman_7
    ];
    const computed = Progression.fromRomanNumerals(this.currentNote, romans);
    this.progressionChordNames = romans.map((r: string, i: number) => r === '-' ? '-' : (computed[i] || '-'));
 }

 private findChordHits(start: number, window: number, chromaToDegree: Map<number, number>): (number | null)[] {
    const hits: (number | null)[] = [];
    for (let stringIdx = 0; stringIdx < this.numberOfString; stringIdx++) {
      let hitFret: number | null = null;
      for (let f = start; f < start + window; f++) {
        const chroma = (f + this.guitarTuning[stringIdx]) % 12;
        if (chromaToDegree.has(chroma)) { hitFret = f; break; }
      }
      hits.push(hitFret);
    }
    return hits;
 }

 private buildChordShape(start: number, window: number, chromaToDegree: Map<number, number>): ChordDiagram {
    const hits = this.findChordHits(start, window, chromaToDegree);
    const rowBase = start === 0 ? 1 : start;
    const rowCount = start === 0 ? window - 1 : window;

    const stringsHighToLow = hits.map((fret, idx) => {
      const tuningValue = this.guitarTuning[idx];
      if (fret === null) {
        return { status: 'muted' as const, fret: null as number | null, degree: null as number | null, tuningValue };
      }
      const chroma = (fret + tuningValue) % 12;
      const degree = chromaToDegree.get(chroma) ?? null;
      return { status: (fret === 0 ? 'open' : 'fretted') as 'open' | 'fretted', fret, degree, tuningValue };
    });

    const stringsLowToHigh = [...stringsHighToLow].reverse();

    const grid: (({ degree: number } | null)[])[] = [];
    for (let r = 0; r < rowCount; r++) {
      const rowFret = rowBase + r;
      grid.push(stringsLowToHigh.map(s =>
        (s.status === 'fretted' && s.fret === rowFret && s.degree !== null) ? { degree: s.degree } : null
      ));
    }

    return {
      positionLabel: start > 0 ? `${start}fr` : '',
      markers: stringsLowToHigh.map(s => s.status === 'open' ? 'O' : s.status === 'muted' ? 'X' : ''),
      grid,
      stringLabels: stringsLowToHigh.map(s => this.generateNoteNames(s.tuningValue, this.accidentals_sharps)),
    };
 }

 computeChordDiagramShapes(chordName: string): ChordDiagram[] {
    const chordData = TonalChord.get(chordName);
    if (!chordData.notes || !chordData.intervals) return [];

    const chromaToDegree = new Map<number, number>();
    chordData.notes.forEach((noteName: string, i: number) => {
      const chroma = Note.chroma(noteName);
      const degree = parseInt(chordData.intervals[i]);
      if (chroma != null && !isNaN(degree)) chromaToDegree.set(chroma, degree);
    });

    const WINDOW = 5;
    const maxStart = this.numbersOfFrets - WINDOW;

    // How many strings get a chord tone within each possible 5-fret window
    const counts: number[] = [];
    for (let start = 0; start <= maxStart; start++) {
      counts.push(this.findChordHits(start, WINDOW, chromaToDegree).filter(h => h !== null).length);
    }

    const bestCount = Math.max(...counts);
    const minAccepted = Math.max(bestCount - 1, this.numberOfString - 2);

    // A "shape" is a local peak in coverage that's still comfortably playable
    const candidates: number[] = [];
    for (let start = 0; start <= maxStart; start++) {
      if (counts[start] < minAccepted) continue;
      const prev = start > 0 ? counts[start - 1] : -1;
      const next = start < maxStart ? counts[start + 1] : -1;
      if (counts[start] >= prev && counts[start] >= next) {
        candidates.push(start);
      }
    }

    // Collapse candidates that are right next to each other (same physical position)
    const chosenStarts: number[] = [];
    for (const start of candidates) {
      if (chosenStarts.length === 0 || start - chosenStarts[chosenStarts.length - 1] >= WINDOW - 2) {
        chosenStarts.push(start);
      }
    }
    if (chosenStarts.length === 0) chosenStarts.push(counts.indexOf(bestCount));

    return chosenStarts.map(start => this.buildChordShape(start, WINDOW, chromaToDegree));
 }

 selectProgressionDegree(degree: number) {
    if (this.isArpeggio) return;
    const chordName = this.progressionChordNames[degree - 1];
    if (!chordName || chordName === '-') return;

    if (this.isProgressionChord && this.currentDegree === degree) {
      this.isProgressionChord = false;
      this.currentChordName = undefined;
      this.currentDegree = undefined;
    } else {
      this.isProgressionChord = true;
      this.currentDegree = degree;
      this.currentChordName = chordName;
    }
    this.getScales();
 }

 clearFretboard() {
    this.currentNote = undefined;
    this.currentScaleName = undefined;
    this.isArpeggio = false;
    this.showAllNoteNames = false;
    this.showDegrees = false;
    this.progressionChordNames = [];
    this.isProgressionChord = false;
    this.currentChordName = undefined;
    this.currentDegree = undefined;
    this.chordDiagrams = [];
    this.chordDiagramLabel = '';

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

    if (this.isProgressionChord && this.currentChordName) {
      const chordData = TonalChord.get(this.currentChordName);
      if (chordData.intervals && chordData.notes) {
        chordData.notes.forEach((noteName: string, i: number) => {
          const chroma = Note.chroma(noteName);
          const degree = parseInt(chordData.intervals[i]);
          if (chroma != null && !isNaN(degree)) chromaToDegree.set(chroma, degree);
        });
      }
      this.chordDiagramLabel = this.currentChordName;
      this.chordDiagrams = this.computeChordDiagramShapes(this.currentChordName);
    } else if (this.isArpeggio) {
      this.chordDiagrams = [];
      this.chordDiagramLabel = '';
      const suffixes: { [k: string]: string } = {
        'arp-major': ' major', 'arp-minor': ' minor',
        'arp-dom7': '7', 'arp-maj7': 'maj7', 'arp-m7': 'm7',
      };
      const suffix = suffixes[this.currentScaleName];
      if (suffix !== undefined) {
        const arpChordName = this.currentNote + suffix;
        const chordData = TonalChord.get(arpChordName);
        if (chordData.intervals && chordData.notes) {
          chordData.notes.forEach((noteName: string, i: number) => {
            const chroma = Note.chroma(noteName);
            const degree = parseInt(chordData.intervals[i]);
            if (chroma != null && !isNaN(degree)) chromaToDegree.set(chroma, degree);
          });
          this.chordDiagramLabel = arpChordName;
          this.chordDiagrams = this.computeChordDiagramShapes(arpChordName);
        }
      }
    } else {
      this.chordDiagrams = [];
      this.chordDiagramLabel = '';
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
