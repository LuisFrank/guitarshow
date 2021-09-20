import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
 
@Injectable({
    providedIn: 'root'
})
export class SocialFeedService {
    private messageCurrentNote = new BehaviorSubject<string>("");
    private messageCurrentScaleName = new BehaviorSubject<string>("");
    currentNote = this.messageCurrentNote.asObservable();
    currentScaleName = this.messageCurrentScaleName.asObservable();

    // changeCurrentNoteAndScale (messageCurrentNote:string, messageCurrentScaleName:string){
    //     this.messageCurrentNote.next(messageCurrentNote);
    //     this.messageCurrentScaleName.next(messageCurrentScaleName);

    // }

    changeCurrentNote (message:string){
        this.messageCurrentNote.next(message);

    }

    changeCurrentScaleName (message:string){
        this.messageCurrentScaleName.next(message);

    }
   

  
}