import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEspecialistaComponent } from './dashboard-especialista.component';

describe('DashboardEspecialistaComponent', () => {
  let component: DashboardEspecialistaComponent;
  let fixture: ComponentFixture<DashboardEspecialistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEspecialistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEspecialistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
