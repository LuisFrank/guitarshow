import { Component, OnInit } from '@angular/core';
// import { Timer } from '';
declare var Timer: any;
@Component({
  selector: 'app-metronome',
  templateUrl: './metronome.component.html',
  styleUrls: ['./metronome.component.scss']
})
export class MetronomeComponent implements OnInit {
  bpm_text = 140;
  beatsPerMeasure_text = 4;

  bpm = 140;
  beatsPerMeasure = 4;

  slider:any;

  tempo_text = "Medium";

  startStop_text = "START";
  count = 0;
  isRunning = false;

  click1= new Audio('././assets/audio/click1.mp3');
  click2= new Audio('././assets/audio/click2.mp3');
  
  metronome:any;

  constructor() { }

  ngOnInit(): void {
    this.slider =  document.querySelector('.sliderRange');
    this.metronome = new Timer( () =>{   
                              this.playClick();
                              },
                              60000/this.bpm, {inmediate: true});

  }

  descreaseTempoBtn(){
    if(this.bpm<21){
      return;
    }

    this.bpm--;
    this.validateTempo();
    this.updateMetronome();
    
  }

  increaseTempoBtn(){  
    if(this.bpm>260){
      return;
    }

    this.bpm++;
    this.validateTempo();
    this.updateMetronome();

   
    
    
  }

  changeSlider(event:any){
    this.bpm = this.slider.value; 
    this.validateTempo();
    this.updateMetronome();
   
  }

  subtractBeats(){
    if(this.beatsPerMeasure<=2){
      return;
    }
    this.beatsPerMeasure--;
    this.beatsPerMeasure_text =  this.beatsPerMeasure;
    this.count = 0;
  }

  addBeats(){
    if(this.beatsPerMeasure>=12){
      return;
    }
    this.beatsPerMeasure++;
    this.beatsPerMeasure_text =  this.beatsPerMeasure;
    this.count = 0;
  }

  updateMetronome(){
    this.bpm_text  = this.bpm;
    this.slider.value = this.bpm; 
    this.metronome.timeInterval = 60000 / this.bpm;
   
    if(this.bpm <=40){this.tempo_text = "Super Slow" }
    if(this.bpm >40 && this.bpm <80){this.tempo_text = "Slow" }
    if(this.bpm >80 && this.bpm <120){this.tempo_text = "Getting there" }
    if(this.bpm >120 && this.bpm <180){this.tempo_text = "Nice and  Steady" }
    if(this.bpm >180 && this.bpm <220){this.tempo_text = "Rock n' Roll" }
    if(this.bpm >220 && this.bpm <240){this.tempo_text = "Funky Stuff" }
    if(this.bpm >240 && this.bpm <260){this.tempo_text = "Relax Dude" }
    if(this.bpm >260 && this.bpm <280){this.tempo_text = "Eddie Van Halen" }
  }

  validateTempo(){
    if(this.bpm<=20){return}
    if(this.bpm>=260){return}
  }

  startStopMetronome(){
    this.count=0;

    if(!this.isRunning){
      this.metronome.start();
      this.isRunning = true;
      this.startStop_text = "STOP";

    }else{
      this.metronome.stop();
      this.isRunning = false;
      this.startStop_text = "START";
    }

  }

  playClick(){
    if(this.count === this.beatsPerMeasure){
      this.count = 0;
    }

    if(this.count === 0 ){
      this.click1.play();
      this.click1.currentTime = 0;

    }else{
      this.click2.play();
      this.click2.currentTime = 0;
    }

    this.count++;

 
  }

  

}
