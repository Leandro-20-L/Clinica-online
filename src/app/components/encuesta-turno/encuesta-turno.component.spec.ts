import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncuestaTurnoComponent } from './encuesta-turno.component';

describe('EncuestaTurnoComponent', () => {
  let component: EncuestaTurnoComponent;
  let fixture: ComponentFixture<EncuestaTurnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncuestaTurnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EncuestaTurnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
