import { AppState } from "../types";
import { Physics } from "../math/Physics";
import { ParticleEngine } from "../graphics/ParticleEngine";
import { CadEngine } from "../graphics/CadEngine";

export class App {
  state: AppState = {
    width: 50,
    height: 40,
    depth: 35,
    thickness: 18,
    portDiam: 10,
    tuningFreq: 38,
    wireframe: false,
  };
  particles: ParticleEngine;
  cad: CadEngine | null = null;

  ui = {
    btnLaunch: document.getElementById("btn-launch")!,
    layers: {
      particle: document.getElementById("particle-canvas")!,
      landing: document.getElementById("landing-layer")!,
      loading: document.getElementById("loading-layer")!,
      dashboard: document.getElementById("dashboard-layer")!,
    },
    wave: document.getElementById("wave-container")!,
    sliders: {
      w: document.getElementById("slider-width") as HTMLInputElement,
      h: document.getElementById("slider-height") as HTMLInputElement,
      d: document.getElementById("slider-depth") as HTMLInputElement,
      p: document.getElementById("slider-diam") as HTMLInputElement,
    },
    nums: {
      w: document.getElementById("num-width") as HTMLInputElement,
      h: document.getElementById("num-height") as HTMLInputElement,
      d: document.getElementById("num-depth") as HTMLInputElement,
      p: document.getElementById("num-diam") as HTMLInputElement,
      f: document.getElementById("num-freq") as HTMLInputElement,
    },
    disp: {
      vol: document.getElementById("vol-display")!,
      len: document.getElementById("port-len-display")!,
      cuts: document.getElementById("cutlist-mini")!,
    },
  };

  constructor() {
    this.particles = new ParticleEngine("particle-canvas");
    this.bindLanding();
  }

  private bindLanding() {
    this.ui.btnLaunch.addEventListener("click", () => {
      this.ui.btnLaunch.classList.add("btn-exploding");
      this.particles.triggerExplosion();

      setTimeout(() => {
        this.ui.layers.landing.style.opacity = "0";
        this.ui.layers.particle.style.opacity = "0";
      }, 600);

      setTimeout(() => {
        this.ui.layers.landing.style.display = "none";
        this.ui.layers.loading.style.opacity = "1";
        this.initWave();
      }, 1000);

      setTimeout(() => {
        this.ui.layers.loading.style.opacity = "0";
        setTimeout(() => (this.ui.layers.loading.style.display = "none"), 500);
        this.ui.layers.dashboard.classList.add("active");

        this.cad = new CadEngine("three-viewport");
        this.bindDashboard();
        this.update();
      }, 3500);
    });
  }

  private initWave() {
    this.ui.wave.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const d = document.createElement("div");
      d.className = "wave-bar h-full mx-1";
      d.style.animationDelay = `${i * 0.1}s`;
      d.style.height = `${Math.random() * 40 + 20}%`;
      this.ui.wave.appendChild(d);
    }
  }

  private bindDashboard() {
    const bind = (
      s: HTMLInputElement,
      n: HTMLInputElement,
      k: keyof AppState,
    ) => {
      s.value = n.value = String(this.state[k]);
      const up = (v: string) => {
        const val = parseFloat(v);
        s.value = n.value = v;
        // @ts-ignore
        this.state[k] = val;
        this.update();
      };
      s.addEventListener("input", (e) =>
        up((e.target as HTMLInputElement).value),
      );
      n.addEventListener("input", (e) =>
        up((e.target as HTMLInputElement).value),
      );
    };

    bind(this.ui.sliders.w, this.ui.nums.w, "width");
    bind(this.ui.sliders.h, this.ui.nums.h, "height");
    bind(this.ui.sliders.d, this.ui.nums.d, "depth");
    bind(this.ui.sliders.p, this.ui.nums.p, "portDiam");

    this.ui.nums.f.addEventListener("input", (e) => {
      this.state.tuningFreq =
        parseFloat((e.target as HTMLInputElement).value) || 38;
      this.update();
    });

    document.getElementById("btn-wireframe")?.addEventListener("click", () => {
      this.state.wireframe = !this.state.wireframe;
      this.update();
    });
  }

  private update() {
    const vol = Physics.getNetVolume(this.state);
    const len = Physics.getPortLength(this.state, vol);

    this.animateVal(this.ui.disp.vol, vol, " L");
    this.ui.disp.len.innerText = `${len.toFixed(1)} cm`;

    const { width: w, height: h, depth: d } = this.state;
    const th = 1.8;
    this.ui.disp.cuts.innerHTML = `
            <div class="flex justify-between border-b border-white/5 py-2"><span>2x Tapa/Base</span><span class="text-gold font-bold">${w} x ${d}</span></div>
            <div class="flex justify-between border-b border-white/5 py-2"><span>2x Laterales</span><span class="text-gold font-bold">${(h - th * 2).toFixed(1)} x ${d}</span></div>
            <div class="flex justify-between border-b border-white/5 py-2"><span>2x Frente/Atrás</span><span class="text-gold font-bold">${(w - th * 2).toFixed(1)} x ${(h - th * 2).toFixed(1)}</span></div>
        `;

    this.cad?.update(this.state);
  }

  private animateVal(el: HTMLElement, end: number, suffix: string) {
    el.innerText = end.toFixed(2) + suffix;
  }
}
