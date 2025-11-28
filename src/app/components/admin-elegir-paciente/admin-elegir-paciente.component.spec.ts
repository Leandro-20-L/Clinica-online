import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminElegirPacienteComponent } from './admin-elegir-paciente.component';

describe('AdminElegirPacienteComponent', () => {
  let component: AdminElegirPacienteComponent;
  let fixture: ComponentFixture<AdminElegirPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminElegirPacienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminElegirPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
