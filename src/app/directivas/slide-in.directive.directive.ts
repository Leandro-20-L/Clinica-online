import {
  Directive,
  ElementRef,
  Renderer2,
  OnInit
} from '@angular/core';
import {
  animate,
  style,
  AnimationBuilder
} from '@angular/animations';

@Directive({
  selector: '[appSlideInDirective]'
})
export class SlideInDirectiveDirective implements OnInit {

    constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private builder: AnimationBuilder
  ) {}

  ngOnInit(): void {
    const animation = this.builder.build([
      style({ transform: 'translateX(-100%)', opacity: 0 }),
      animate('400ms ease-out',
        style({ transform: 'translateX(0)', opacity: 1 })
      )
    ]);

    const player = animation.create(this.el.nativeElement);
    player.play();
  }

}
