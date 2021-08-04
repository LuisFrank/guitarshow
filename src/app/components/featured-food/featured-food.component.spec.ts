import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedFoodComponent } from './featured-food.component';

describe('FeaturedFoodComponent', () => {
  let component: FeaturedFoodComponent;
  let fixture: ComponentFixture<FeaturedFoodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturedFoodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturedFoodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
