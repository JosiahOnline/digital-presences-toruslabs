(() => {
  'use strict';
  // Small groups of still frames avoid mobile video playback/seek restrictions.
  // Only five decoded sheets stay in memory; requests follow the latest scroll.
  class TorusScrollFrames {
    constructor(canvas, {onReady, onDraw, onError}) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d', {alpha:false});
      this.onReady = onReady;
      this.onDraw = onDraw;
      this.onError = onError;
      this.cache = new Map();
      this.pending = new Map();
      this.failed = new Set();
      this.time = 0;
      this.lastFrame = -1;
      this.ready = false;
      this.active = false;
      this.errorShown = false;
    }
    load() { this.active = true; this.seek(this.time); }
    stop() { this.active = false; }
    request(index) {
      if (index < 0 || index >= 60 || this.cache.has(index) || this.pending.has(index) || this.failed.has(index) || this.pending.size >= 4) return;
      const image = new Image();
      this.pending.set(index, image);
      image.onload = () => {
        this.pending.delete(index);
        image.onload = image.onerror = null;
        this.cache.set(index, image);
        while (this.cache.size > 5) this.cache.delete(this.cache.keys().next().value);
        this.seek(this.time);
      };
      image.onerror = () => {
        this.pending.delete(index);
        image.onload = image.onerror = null;
        this.failed.add(index);
        this.seek(this.time);
      };
      image.src = `motion/scroll-frames/sheet-${String(index + 1).padStart(3, '0')}.jpg?v=1`;
    }
    seek(time) {
      this.time = time;
      if (!this.active) return;
      const frame = Math.max(0, Math.min(359, Math.round(time * 12)));
      const sheet = Math.floor(frame / 6);
      const direction = frame < this.lastFrame ? -1 : 1;
      const image = this.cache.get(sheet);
      if (image && this.context) {
        this.cache.delete(sheet);
        this.cache.set(sheet, image);
        if (frame !== this.lastFrame) {
          const tile = frame % 6;
          this.context.drawImage(image, (tile % 2) * 640, Math.floor(tile / 2) * 360, 640, 360, 0, 0, this.canvas.width, this.canvas.height);
          this.lastFrame = frame;
          this.onDraw(frame / 12);
          if (!this.ready) { this.ready = true; this.onReady(); }
        }
      } else if (this.failed.has(sheet) && !this.errorShown) {
        this.errorShown = true;
        this.onError();
      }
      // Prioritize the requested sheet, then nearby frames in both directions.
      this.request(sheet);
      this.request(sheet + direction);
      this.request(sheet - direction);
      this.request(sheet + 2 * direction);
    }
  }
  window.TorusScrollFrames = TorusScrollFrames;
})();
