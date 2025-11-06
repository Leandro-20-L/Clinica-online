import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResenaTurnoComponent } from './resena-turno.component';

describe('ResenaTurnoComponent', () => {
  let component: ResenaTurnoComponent;
  let fixture: ComponentFixture<ResenaTurnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResenaTurnoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResenaTurnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
