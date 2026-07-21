import {Component} from "./component";

class SlideshowComponent extends Component {
  static get observedAttributes() {
    return ['autoplay', 'interval'];
  }

  constructor() {
    super();
    this.currentIndex = 0;
    this.totalSlides = 0;
  }

  connectedCallback() {
    super.connectedCallback();
    this.autoplay = this.getAttribute('autoplay') !== false;
    this.interval = this.getAttribute('interval') || 5000;
  }

  disconnectedCallback() {
    this.stopAutoplay()
  }

  jumpToSlide(index) {}

  startAutoplay() {}

  stopAutoplay() {}

  resetAutoplay() {}
}