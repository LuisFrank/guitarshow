import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { featured } from 'src/app/mocks/index'



declare var ml5: any;
declare var p5: any;
// declare var stream: any;
let pitch :any;


// declare var setup: any;

@Component({
  selector: 'app-featured-food',
  templateUrl: './featured-food.component.html',
  styleUrls: ['./featured-food.component.scss']
})
export class FeaturedFoodComponent implements OnInit  {

  featured: any = featured;
  start:boolean = false;
  // mic: any;

  // audioInput = null;
  // microphone_stream = null;
  // gain_node = null;
  // script_processor_node = null;
  // script_processor_fft_node = null;
  // analyserNode = null;

  // play: boolean = false;
  
  audioContext:any;
  mic :any;
  pitch :any;
  stream: any;
  frequency:any = 0;
  threshold = 1;
  notes = [
    // E: 82 Hz (E2 Musical Note)

    // A: 110 Hz (A2 Musical Note)

    // D: 147 Hz (D3 Musical Note)

    // G: 196 Hz (G3 Musical Note)

    // B: 247 Hz (B3 Musical Note)

    // E: 330 Hz (E4 Musical Note)

    {note:'E',freq: 82.407},
    {note:'A',freq: 110},
    {note:'D',freq: 146.832},
    {note:'G',freq: 195.998},
    {note:'B',freq: 246.942},
    {note:'E',freq: 329.628}

  ];

  constructor(private elementRef:ElementRef) {
   
   }
 

   Iniciar(){
    this.demo();
   
   }

  async demo(){
    this.audioContext = new AudioContext();
    var stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    this.startPitch(stream,this.audioContext);   
  }

  startPitch(stream:any,context:any){
    var pitch = ml5.pitchDetection('././assets/crepe_models_3',
    context , 
    stream,
    () =>{
      console.log("model loaded", ":)");  
      
        this.getPitch(pitch);
    }    
    )  
  }


  getPitch(pitch:any) {  

      pitch.getPitch((err:any, frequency:any) => {
        if (frequency) {
            console.log("frequency",frequency);
            this.frequency=frequency;
        } else {
            console.log("err",err);
        }
        this.getPitch(pitch);
      })
  } 



  ngOnInit(): void {  
    this.loadCanvas();
  }

  loadCanvas(){
    const s = (p:any) => {

      let canvas;        

      p.preload = () => {
        console.log('preload');        
      }               

      p.setup = () => {
        canvas = p.createCanvas(400, 400);        
        canvas.parent('draws');       
      }

      p.draw = () => {
       
        p.background(0);       
        p.textAlign(p.CENTER,p.CENTER);  
        p.fill(255);
        p.textSize(32);      
        p.text(this.frequency.toFixed(2),p.width /2,  p.height-150);
       


        var closestNote:any;
        let recordDiff = Infinity;

        for (let index = 0; index < this.notes.length; index++) {
          let diff = this.frequency - this.notes[index].freq;
          if(p.abs(diff)<p.abs(recordDiff)){
            closestNote = this.notes[index];
            recordDiff = diff;
          }        
        }

        p.textSize(64);
        p.text(closestNote.note,p.width /2,  p.height-50);


        let diff = recordDiff;

        let alpha = p.map(p.abs(diff),0,100,255,0);
        p.rectMode(p.CENTER);
        p.fill(255,alpha);
        p.stroke(255);
        p.strokeWeight(1);
        if(p.abs(diff) < this.threshold ){
          p.fill(0,255,0);
        }        
        p.rect(200,100,200,50);

        p.stroke(255);
        p.strokeWeight(4);
        p.line(200,0,200,200);

        p.noStroke();
        p.fill(255,0,0);
        if(p.abs(diff)< this.threshold){
          p.fill(0,255,0);
        }

        p.rect(200+ diff,100,10,75);


      };
      
    }
    let player = new p5(s);    

  }
  


  

  
}



