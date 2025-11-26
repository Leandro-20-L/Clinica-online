import { Directive, ElementRef, OnInit } from '@angular/core';
import { AnimationBuilder, animate, style } from '@angular/animations';

@Directive({
  selector: '[appSlideUp]'
})
export class SlideUpDirective implements OnInit {

  constructor(
    private el: ElementRef,
    private builder: AnimationBuilder
  ) {}

  ngOnInit(): void {
    const animation = this.builder.build([
      style({ transform: 'translateY(30px)', opacity: 0 }),
      animate(
        '350ms ease-out',
        style({ transform: 'translateY(0)', opacity: 1 })
      )
    ]);

    const player = animation.create(this.el.nativeElement);
    player.play();
  }

}
