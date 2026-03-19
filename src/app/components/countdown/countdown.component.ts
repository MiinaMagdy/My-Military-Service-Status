import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'star' | 'ribbon' | 'circle';
  life: number;
  maxLife: number;
  gravity: number;
}

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit, OnDestroy, AfterViewInit {
  daysRemaining: number = 0;
  isCompleted: boolean = false;

  @Input() endDate!: Date;
  @ViewChild('confettiCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private animationFrameId: number | null = null;
  private particles: Particle[] = [];
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private burstTriggered = false;

  // Color palettes for the military celebration theme
  private readonly colors = [
    '#d4af37', // Gold
    '#f0d060', // Light gold
    '#c5a028', // Dark gold
    '#059669', // Military green
    '#4a7c59', // Olive green
    '#ffffff', // White sparkle
    '#fef3c7', // Warm white
    '#b8860b', // Dark goldenrod
  ];

  ngOnInit() {
    this.calculateDaysRemaining(this.endDate);
    this.intervalId = setInterval(() => {
      this.calculateDaysRemaining(this.endDate);
    }, 1000 * 60 * 60);
  }

  ngAfterViewInit() {
    if (this.isCompleted && this.canvasRef) {
      this.initCanvas();
      this.triggerCelebration();
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private calculateDaysRemaining(endTime: Date): void {
    const diffTime = endTime.getTime() - Date.now();
    this.daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    this.isCompleted = this.daysRemaining <= 0;

    if (this.isCompleted && !this.burstTriggered && this.canvasRef) {
      this.initCanvas();
      this.triggerCelebration();
    }
  }

  private initCanvas(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    const parent = this.canvas.parentElement;
    if (parent) {
      this.canvas.width = parent.offsetWidth;
      this.canvas.height = parent.offsetHeight;
    }
  }

  private triggerCelebration(): void {
    if (this.burstTriggered) return;
    this.burstTriggered = true;

    // Initial large burst
    this.createBurst(this.canvas.width / 2, this.canvas.height / 2, 120);

    // Staggered secondary bursts
    setTimeout(() => this.createBurst(this.canvas.width * 0.25, this.canvas.height * 0.4, 50), 300);
    setTimeout(() => this.createBurst(this.canvas.width * 0.75, this.canvas.height * 0.4, 50), 500);
    setTimeout(() => this.createBurst(this.canvas.width * 0.5, this.canvas.height * 0.3, 60), 800);

    // Start continuous but lighter shimmer (every 3s)
    setInterval(() => {
      if (this.particles.length < 40) {
        this.createShimmer();
      }
    }, 3000);

    this.animate();
  }

  private createBurst(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 6;
      const shapes: Particle['shape'][] = ['star', 'ribbon', 'circle'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: shape === 'star' ? 6 + Math.random() * 8 : 3 + Math.random() * 5,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        shape,
        life: 0,
        maxLife: 100 + Math.random() * 80,
        gravity: 0.04 + Math.random() * 0.03,
      });
    }
  }

  private createShimmer(): void {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0.5 + Math.random() * 1.5,
        size: 2 + Math.random() * 4,
        color: this.colors[Math.floor(Math.random() * 3)], // Gold palette only
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        opacity: 0.8,
        shape: Math.random() > 0.5 ? 'star' : 'circle',
        life: 0,
        maxLife: 120 + Math.random() * 60,
        gravity: 0.01,
      });
    }
  }

  private animate = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;

      // Fade out in the last 30% of life
      const fadeStart = p.maxLife * 0.7;
      if (p.life > fadeStart) {
        p.opacity = Math.max(0, 1 - (p.life - fadeStart) / (p.maxLife - fadeStart));
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      switch (p.shape) {
        case 'star':
          this.drawStar(p.size, p.color);
          break;
        case 'ribbon':
          this.drawRibbon(p.size, p.color);
          break;
        case 'circle':
          this.drawCircle(p.size, p.color);
          break;
      }

      this.ctx.restore();
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private drawStar(size: number, color: string): void {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;

    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 6;

    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * i) / spikes - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }

    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  private drawRibbon(size: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(-size / 2, -size * 1.5, size, size * 3);
  }

  private drawCircle(size: number, color: string): void {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 8;
    this.ctx.arc(0, 0, size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }
}
