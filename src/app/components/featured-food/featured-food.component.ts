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
  tunerError = '';

 

  notes = [
    // Octave 2
    { note: 'E',  freq: 82.407  }, { note: 'F',  freq: 87.307  },
    { note: 'F#', freq: 92.499  }, { note: 'G',  freq: 97.999  },
    { note: 'G#', freq: 103.826 }, { note: 'A',  freq: 110.000 },
    { note: 'A#', freq: 116.541 }, { note: 'B',  freq: 123.471 },
    // Octave 3
    { note: 'C',  freq: 130.813 }, { note: 'C#', freq: 138.591 },
    { note: 'D',  freq: 146.832 }, { note: 'D#', freq: 155.563 },
    { note: 'E',  freq: 164.814 }, { note: 'F',  freq: 174.614 },
    { note: 'F#', freq: 184.997 }, { note: 'G',  freq: 195.998 },
    { note: 'G#', freq: 207.652 }, { note: 'A',  freq: 220.000 },
    { note: 'A#', freq: 233.082 }, { note: 'B',  freq: 246.942 },
    // Octave 4
    { note: 'C',  freq: 261.626 }, { note: 'C#', freq: 277.183 },
    { note: 'D',  freq: 293.665 }, { note: 'D#', freq: 311.127 },
    { note: 'E',  freq: 329.628 }, { note: 'F',  freq: 349.228 },
    { note: 'F#', freq: 369.994 }, { note: 'G',  freq: 391.995 },
    { note: 'G#', freq: 415.305 }, { note: 'A',  freq: 440.000 },
    { note: 'A#', freq: 466.164 }, { note: 'B',  freq: 493.883 },
    // Octave 5
    { note: 'C',  freq: 523.251 }, { note: 'C#', freq: 554.365 },
    { note: 'D',  freq: 587.330 }, { note: 'D#', freq: 622.254 },
    { note: 'E',  freq: 659.255 }, { note: 'F',  freq: 698.456 },
    { note: 'F#', freq: 739.989 }, { note: 'G',  freq: 783.991 },
    { note: 'G#', freq: 830.609 }, { note: 'A',  freq: 880.000 },
    { note: 'A#', freq: 932.328 }, { note: 'B',  freq: 987.767 },
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

  async loadTuner() {
    this.tunerError = '';
    try {
      this.audioContext = new AudioContext();
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.startPitch(this.stream, this.audioContext);
    } catch (err: any) {
      this.start = false;
      this.startStop_tuner = 'Start';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.tunerError = 'Permiso de micrófono denegado. Habilítalo en la configuración del navegador.';
      } else {
        this.tunerError = 'No se pudo acceder al micrófono. Verifica tu dispositivo de audio.';
      }
    }
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
    const s = (p: any) => {
      const w = 400;
      const h = 260;
      let canvas: any;

      p.setup = () => {
        canvas = p.createCanvas(w, h);
        canvas.parent('draws');
      };

      p.draw = () => {
        // Dark warm background matching --color-bg
        p.background(15, 8, 4);
        p.textAlign(p.CENTER, p.CENTER);
        p.noStroke();

        if (this.frequency <= 0) {
          p.fill(100, 84, 56);
          p.textSize(14);
          p.text('Esperando señal de audio...', w / 2, h / 2);
          return;
        }

        // Find closest chromatic note
        let closestNote: any;
        let recordDiff = Infinity;
        for (let i = 0; i < this.notes.length; i++) {
          const diff = this.frequency - this.notes[i].freq;
          if (Math.abs(diff) < Math.abs(recordDiff)) {
            closestNote = this.notes[i];
            recordDiff = diff;
          }
        }

        // Cents deviation: 1200 * log2(f / f_target)
        const cents = Math.round(1200 * Math.log2(this.frequency / closestNote.freq));
        const inTune = Math.abs(cents) <= 5;

        const amber = p.color(201, 168, 76);
        const green = p.color(16, 185, 129);
        const accent = inTune ? green : amber;

        // Note name (large, centered)
        p.fill(accent);
        p.textSize(80);
        p.text(closestNote.note, w / 2, h * 0.4);

        // Frequency (small, muted)
        p.fill(100, 84, 56);
        p.textSize(12);
        p.text(this.frequency.toFixed(1) + ' Hz', w / 2, h * 0.68);

        // Cents label
        p.fill(accent);
        p.textSize(13);
        const centsLabel = cents === 0 ? '♪  Afinado' : (cents > 0 ? '+' : '') + cents + ' cents';
        p.text(centsLabel, w / 2, h * 0.81);

        // Tuning bar track
        const barW = w * 0.72;
        const barH = 6;
        const barX = (w - barW) / 2;
        const barY = h * 0.91;
        p.fill(30, 18, 6);
        p.rect(barX, barY, barW, barH, 3);

        // Center tick
        p.stroke(60, 40, 12);
        p.strokeWeight(1);
        p.line(w / 2, barY - 5, w / 2, barY + barH + 5);
        p.noStroke();

        // Needle
        const maxCents = 50;
        const needleX = p.constrain(
          w / 2 + (cents / maxCents) * (barW / 2),
          barX + 4, barX + barW - 4
        );
        p.fill(accent);
        p.rect(needleX - 5, barY - 5, 10, barH + 10, 2);
      };
    };
    new p5(s);
  }
  


  

  
}



