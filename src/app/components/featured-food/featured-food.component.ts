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
  
  audioContext:any;
  mic :any;
  pitch :any;
  stream: any;
  frequency:any = 0;
  threshold = 1;

  startStop_tuner = "START";
  startTunerBool = false;

 

  notes = [


    {note:'E',freq: 82.407},
    {note:'A',freq: 110},
    {note:'D',freq: 146.832},
    {note:'G',freq: 195.998},
    {note:'B',freq: 246.942},
    {note:'E',freq: 329.628}

  ];

 

  constructor(private elementRef:ElementRef) {
   
   }

   startTuner(){
     console.log("tuner");
     console.log("tuner-this.start",this.start);
      if(!this.start){     
        this.startStop_tuner = "Stop";
        this.start = !this.start;       
        this.loadTuner();
       
      }else{
        this.start = !this.start;
        this.startStop_tuner = "Start";      
        this.stopTuner();
      }
   }

  stopTuner(){
    this.stream.getAudioTracks()[0].stop();
  } 

  async loadTuner(){
    this.audioContext = new AudioContext();
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    console.log("strean",this.stream);
    this.startPitch( this.stream,this.audioContext);   
  }

  startPitch(stream:any,context:any){
    this.pitch = ml5.pitchDetection('././assets/crepe_models_3',
    context , 
    stream,
    () =>{
      console.log("model loaded", ":)");  
      
        this.getPitch(this.pitch);
    }    
    )  
  }


  getPitch(pitch:any) {  

      pitch.getPitch((err:any, frequency:any) => {
        if (frequency) {
            // console.log("frequency",frequency);
            this.frequency=frequency;
        } else {
            // console.log("err",err);
        }
        this.getPitch(pitch);
      })
  } 



  ngOnInit(): void {  
    this.loadCanvas();
  }

  loadCanvas(){
    const s = (p:any) => {

      // var w = window.innerWidth * 0.27;
      // var h = window.innerHeight * 0.4; 

      var w = 400;
      var h = 400; 
      // if( window.innerWidth < 768){
      //   console.log(" window.innerWidth if", window.innerWidth);
      //   // w = window.innerWidth *0.8;
      //   // h = window.innerHeight *0.2;  
      //   w = 325;
      //   h = 325;  
      // }else{
      //   console.log(" window.innerWidth else", window.innerWidth);
      //   w = 400;
      //   h = 400;  
      // }
       
      
      let canvas:any;        

      p.preload = () => {
        console.log('preload');        
      }               

      p.setup = () => {
        canvas = p.createCanvas(w,h);        
        canvas.parent('draws');       
      }
      // p.windowResized = () => {
      //     // assigns new values for width and height variables
      //       console.log("REeize w", w = window.innerWidth);
      //       console.log("REeize h", h = window.innerHeight);
      //   // w = window.innerWidth/4.5;
      //   // h = window.innerHeight; 
      //   // w = window.innerWidth * 0.2;
      //   // h = window.innerHeight * 0.1; 
      //   if( window.innerWidth < 768){
      //     // w = window.innerWidth *0.8;
      //     // h = window.innerHeight *0.2;  
      //     w = 325;
      //     h = 325;  
      //   }else{
      //     w = 400;
      //     h = 400;  
      //   }
         
      //   p.resizeCanvas(w, h,true);
      // }

      // window.onresize = function() {
      //   console.log("REeize");
      //   console.log("REeize", w = window.innerWidth);
      //   console.log("REeize", h = window.innerHeight);
       
      
       
      //   // canvas.size(this.w,this.h);    
      // }

     

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



