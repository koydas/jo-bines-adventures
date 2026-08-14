import { touchState } from "./touchState";

/**
 * On-screen touch controls for mobile (iPhone Safari, PWA). Rendered as a
 * DOM overlay rather than inside the Phaser canvas: it's crisper, easier to
 * style for iOS safe areas, and keeps hit-testing simple with native touch
 * events.
 *
 * Only shown on touch-capable devices; a keyboard/mouse player never sees it.
 * Created once for the whole app (see main.ts) and persists across scene
 * transitions, writing into the shared `touchState` that each scene's
 * InputManager reads from.
 */
export class TouchControls {
  private root: HTMLDivElement;
  private contextButton: HTMLButtonElement;

  constructor() {
    this.root = document.createElement("div");
    this.root.className = "touch-controls";
    this.root.innerHTML = `
      <div class="tc-dpad">
        <button class="tc-btn tc-left" aria-label="Gauche">◀</button>
        <button class="tc-btn tc-right" aria-label="Droite">▶</button>
      </div>
      <button class="tc-btn tc-context" aria-label="Entrer">▲</button>
      <div class="tc-actions">
        <button class="tc-btn tc-item" aria-label="Potion">🧪</button>
        <button class="tc-btn tc-action" aria-label="Attaquer / Parler">⚔️</button>
      </div>
    `;
    document.body.appendChild(this.root);
    this.injectStyles();

    this.contextButton = this.root.querySelector(".tc-context")!;
    this.contextButton.style.display = "none";

    this.bindHold(".tc-left", (down) => (touchState.left = down));
    this.bindHold(".tc-right", (down) => (touchState.right = down));
    this.bindTap(".tc-action", () => (touchState.actionQueued = true));
    this.bindTap(".tc-item", () => (touchState.itemQueued = true));
    this.bindTap(".tc-context", () => (touchState.upQueued = true));

    if (!this.isTouchDevice()) {
      this.root.style.display = "none";
    }
  }

  /** Show/hide the contextual "enter" button (portal, door, ...). */
  setContextVisible(visible: boolean) {
    this.contextButton.style.display = visible ? "flex" : "none";
  }

  destroy() {
    this.root.remove();
  }

  private isTouchDevice(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  private bindHold(selector: string, setDown: (down: boolean) => void) {
    const el = this.root.querySelector<HTMLElement>(selector)!;
    const start = (e: Event) => {
      e.preventDefault();
      setDown(true);
      el.classList.add("active");
    };
    const end = (e: Event) => {
      e.preventDefault();
      setDown(false);
      el.classList.remove("active");
    };
    el.addEventListener("touchstart", start, { passive: false });
    el.addEventListener("touchend", end, { passive: false });
    el.addEventListener("touchcancel", end, { passive: false });
    el.addEventListener("mousedown", start);
    window.addEventListener("mouseup", end);
  }

  private bindTap(selector: string, onTap: () => void) {
    const el = this.root.querySelector<HTMLElement>(selector)!;
    const fire = (e: Event) => {
      e.preventDefault();
      onTap();
      el.classList.add("active");
      setTimeout(() => el.classList.remove("active"), 120);
    };
    el.addEventListener("touchstart", fire, { passive: false });
    el.addEventListener("mousedown", fire);
  }

  private injectStyles() {
    if (document.getElementById("tc-styles")) return;
    const style = document.createElement("style");
    style.id = "tc-styles";
    style.textContent = `
      .touch-controls {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 50;
        font-family: -apple-system, system-ui, sans-serif;
      }
      .touch-controls .tc-btn {
        pointer-events: auto;
        touch-action: none;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        -webkit-tap-highlight-color: transparent;
        backdrop-filter: blur(2px);
      }
      .touch-controls .tc-btn.active {
        background: rgba(255, 255, 255, 0.32);
      }
      .tc-dpad {
        position: absolute;
        left: max(16px, env(safe-area-inset-left));
        bottom: max(20px, env(safe-area-inset-bottom));
        display: flex;
        gap: 14px;
      }
      .tc-dpad .tc-btn {
        width: 66px;
        height: 66px;
        font-size: 26px;
      }
      .tc-actions {
        position: absolute;
        right: max(16px, env(safe-area-inset-right));
        bottom: max(20px, env(safe-area-inset-bottom));
        display: flex;
        align-items: flex-end;
        gap: 14px;
      }
      .tc-actions .tc-action {
        width: 82px;
        height: 82px;
        font-size: 32px;
        background: rgba(200, 60, 60, 0.35);
      }
      .tc-actions .tc-item {
        width: 60px;
        height: 60px;
        font-size: 24px;
        margin-bottom: 10px;
      }
      .tc-context {
        position: absolute;
        left: 50%;
        bottom: max(150px, calc(env(safe-area-inset-bottom) + 150px));
        transform: translateX(-50%);
        width: 60px;
        height: 60px;
        font-size: 22px;
        background: rgba(80, 200, 120, 0.4);
      }
      @media (min-aspect-ratio: 1/1) {
        .tc-dpad .tc-btn { width: 58px; height: 58px; }
        .tc-actions .tc-action { width: 72px; height: 72px; }
      }
    `;
    document.head.appendChild(style);
  }
}
