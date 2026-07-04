import { Component, OnInit } from '@angular/core';
import { products } from 'src/app/mocks/index';
import progressions from 'src/app/mocks/progressions';
import { Progression, Chord as TonalChord } from "@tonaljs/tonal";
import { SocialFeedService } from '../social-feed/social-feed.service';

@Component({
  selector: 'app-our-products',
  templateUrl: './our-products.component.html',
  styleUrls: ['./our-products.component.scss']
})
export class OurProductsComponent implements OnInit {

  productsList = products;
  activeTab = 0;
  progressionsList = JSON.parse(JSON.stringify(progressions));

  current_Note: string = '';
  current_ScaleName: string = '';
  current_scale_index = 0;

  isArpeggioMode = false;
  arpeggioLabel = '';
  arpeggioNotes: { note: string; degree: number }[] = [];

  constructor(private socialFeedService: SocialFeedService) {}

  ngOnInit(): void {
    this.activeTab = 1;

    this.socialFeedService.currentNote.subscribe(note => {
      this.current_Note = note;
      this.setScaleAndNote();
    });

    this.socialFeedService.currentScaleName.subscribe(scaleName => {
      this.current_ScaleName = scaleName;
      this.setScaleAndNote();
    });
  }

  setScaleAndNote() {
    this.progressionsList = JSON.parse(JSON.stringify(progressions));

    if (!this.current_Note) return;

    if (this.current_ScaleName?.startsWith('arp-')) {
      this.isArpeggioMode = true;
      this.computeArpeggioChord();
      return;
    }

    this.isArpeggioMode = false;

    // Compute chord names for ALL rows based on selected root
    this.progressionsList.forEach((value: any, index: any) => {
      const romans = [
        value.roman_1, value.roman_2, value.roman_3,
        value.roman_4, value.roman_5, value.roman_6, value.roman_7
      ];
      const computed = Progression.fromRomanNumerals(this.current_Note, romans);
      value.roman_1 = computed[0] || '-';
      value.roman_2 = computed[1] || '-';
      value.roman_3 = computed[2] || '-';
      value.roman_4 = computed[3] || '-';
      value.roman_5 = computed[4] || '-';
      value.roman_6 = computed[5] || '-';
      value.roman_7 = computed[6] || '-';

      if (value.name === this.current_ScaleName) {
        this.current_scale_index = index;
      }
    });
  }

  private computeArpeggioChord() {
    const configs: { [k: string]: { label: string; suffix: string } } = {
      'arp-major': { label: 'Mayor',       suffix: ' major' },
      'arp-minor': { label: 'Menor',       suffix: ' minor' },
      'arp-dom7':  { label: '7 Dominante', suffix: '7'      },
      'arp-maj7':  { label: 'maj7 Mayor',  suffix: 'maj7'   },
      'arp-m7':    { label: '7b Menor',    suffix: 'm7'     },
    };
    const cfg = configs[this.current_ScaleName];
    if (!cfg || !this.current_Note) { this.arpeggioNotes = []; return; }

    this.arpeggioLabel = this.current_Note + ' ' + cfg.label;
    const chord = TonalChord.get(this.current_Note + cfg.suffix);
    this.arpeggioNotes = chord.notes.map((n: string, i: number) => ({
      note: n,
      degree: parseInt(chord.intervals[i])
    }));
  }
}
