// Cross-tab/app lightweight sync using BroadcastChannel with storage fallback

type MutatedMessage = { type: 'mutated'; keys: string[] };

const CHANNEL = 'seventhpath-sync';
let bc: BroadcastChannel | null = null;

type Listener = (msg: MutatedMessage) => void;
let handler: Listener | null = null;

export function start(onMessage: Listener) {
  handler = onMessage;
  try {
    bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (ev) => {
      if (ev?.data?.type === 'mutated') handler && handler(ev.data as MutatedMessage);
    };
  } catch {
    // Fallback to localStorage 'storage' event
    window.addEventListener('storage', (e) => {
      if (e.key === CHANNEL && e.newValue) {
        try {
          const data = JSON.parse(e.newValue) as MutatedMessage;
          if (data?.type === 'mutated') handler && handler(data);
        } catch {}
      }
    });
  }
}

export function postMutated(keys: string[]) {
  const msg: MutatedMessage = { type: 'mutated', keys };
  try {
    if (bc) bc.postMessage(msg);
    else localStorage.setItem(CHANNEL, JSON.stringify(msg));
  } catch {}
}

