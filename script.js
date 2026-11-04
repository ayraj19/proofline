// Proofline landing page interactions
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);

  /* ---------- Live evidence record ---------- */
  const SCENARIOS = {
    headphones: {
      order: "4821", price: 320, agent: "Shopping agent in ChatGPT",
      intent: "“Noise-cancelling headphones under $350, here by Friday”",
      item: "Wireless noise-cancelling headphones, $320",
      reason: "Visa 10.4, card-absent fraud", proof: "Delivered and signed for Thursday"
    },
    tickets: {
      order: "7310", price: 480, agent: "Browser agent (Perplexity Comet)",
      intent: "“Two floor seats for Saturday, max $500 total”",
      item: "2 × floor tickets, Saturday 8 pm, $480",
      reason: "Mastercard 4837, no cardholder authorization", proof: "Tickets scanned at the venue gate"
    },
    flight: {
      order: "1956", price: 612, agent: "Travel agent assistant",
      intent: "“Cheapest nonstop to Denver on the 14th, morning”",
      item: "Nonstop flight, 7:05 am on the 14th, $612",
      reason: "Visa 13.3, not as described", proof: "Boarding pass issued and used"
    }
  };

  const STEPS = [
    "Place agent order", "Send confirmation", "Seal the record",
    "Customer disputes", "Build the response", "Run it again"
  ];

  let step = 0;
  const btn = $("advance"), log = $("log"), stamp = $("stamp"), bar = $("bar");
  const picker = document.querySelector(".scenarios");
  const current = () => SCENARIOS[document.querySelector('input[name="scn"]:checked').value];

  function setField(id, text) {
    const el = $(id);
    el.textContent = text;
    el.classList.remove("fresh"); void el.offsetWidth; el.classList.add("fresh");
  }

  function addLog(time, text, cls) {
    const li = document.createElement("li");
    if (cls) li.className = cls;
    li.innerHTML = `<time>${time}</time><span></span>`;
    li.querySelector("span").textContent = text;
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
  }

  async function fingerprint(text) {
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) { // non-secure contexts: simple fallback
      let h = 2166136261;
      for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
      return (h >>> 0).toString(16).padStart(8, "0").repeat(8);
    }
  }

  function fmtDate(d) {
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function reset() {
    step = 0;
    log.innerHTML = "";
    ["fAgent", "fIntent", "fItem", "fConfirm", "fHash", "fKeep"].forEach((id) => ($(id).textContent = "—"));
    $("recId").textContent = "Order #—";
    stamp.classList.remove("on", "won");
    stamp.textContent = "Sealed";
    picker.classList.remove("locked");
    picker.querySelectorAll("input").forEach((i) => (i.disabled = false));
    btn.textContent = STEPS[0];
    bar.style.width = "0%";
  }

  async function advance() {
    const s = current();
    switch (step) {
      case 0:
        picker.classList.add("locked");
        picker.querySelectorAll("input").forEach((i) => (i.disabled = true));
        $("recId").textContent = `Order #${s.order}`;
        setField("fAgent", s.agent);
        setField("fIntent", s.intent);
        setField("fItem", s.item);
        addLog("Day 0", "Order received and tagged as agent-placed", "key");
        break;
      case 1:
        setField("fConfirm", "Customer tapped “Yes, I asked for this” in 2 min");
        addLog("Day 0", `Confirmation emailed: order over $250 rule`);
        addLog("Day 0", "Customer confirmed the purchase", "key");
        break;
      case 2: {
        const hash = await fingerprint(JSON.stringify(s) + Date.now());
        setField("fHash", hash);
        const keep = new Date(); keep.setDate(keep.getDate() + 540);
        setField("fKeep", `${fmtDate(keep)} (540 days, locked against edits)`);
        stamp.textContent = "Sealed";
        stamp.classList.add("on");
        addLog("Day 0", "Record signed, chained and locked", "key");
        addLog("Day 4", `${s.proof}, added as a new version`);
        break;
      }
      case 3:
        addLog("Day 61", `Dispute opened: ${s.reason}`, "bad");
        addLog("Day 61", "Deadline set; response drafted from the sealed record");
        break;
      case 4: {
        const fee = Math.round(s.price * 0.2);
        addLog("Day 62", "Response submitted with instruction, confirmation and delivery proof");
        addLog("Day 89", `Won. $${s.price} returned to you, fee $${fee}`, "good");
        stamp.classList.remove("on"); void stamp.offsetWidth;
        stamp.textContent = "Won";
        stamp.classList.add("won", "on");
        break;
      }
      default:
        reset();
        return;
    }
    step++;
    bar.style.width = `${Math.min(step / 5, 1) * 100}%`;
    btn.textContent = STEPS[step];
  }

  btn.addEventListener("click", advance);
  picker.addEventListener("change", reset);
  reset();

  /* ---------- Exposure calculator ---------- */
  const rev = $("rev"), share = $("share"), rate = $("rate");
  const money = (n) => {
    if (n >= 1e6) return `$${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
    if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
    return `$${Math.round(n)}`;
  };
  const WIN_WITHOUT = 0.2, WIN_WITH = 0.55;

  function calc() {
    const r = +rev.value, sh = +share.value / 100, dr = +rate.value / 100;
    $("revOut").textContent = money(r);
    $("shareOut").textContent = `${(+share.value).toFixed(1)}%`;
    $("rateOut").textContent = `${(+rate.value).toFixed(1)}%`;
    const disputed = r * 12 * sh * dr;
    const without = disputed * WIN_WITHOUT, withP = disputed * WIN_WITH;
    $("oDisputed").textContent = money(disputed);
    $("oWithout").textContent = money(without);
    $("oWith").textContent = money(withP);
    $("oGain").textContent = money(withP - without);
    $("bWithout").style.width = `${WIN_WITHOUT * 100}%`;
    $("bWith").style.width = `${WIN_WITH * 100}%`;
  }
  [rev, share, rate].forEach((el) => el.addEventListener("input", calc));
  calc();

  /* ---------- Explainer video ---------- */
  // The silent preview loop autoplays unless the visitor prefers reduced
  // motion; the button swaps in the full explainer with sound and controls.
  const player = $("player"), video = $("watchVideo"), play = $("watchPlay");
  if (player && video && play) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      video.preload = "auto";
      video.play().catch(() => {}); // autoplay can be blocked; the poster stays up
    }
    play.addEventListener("click", () => {
      video.loop = false;
      video.muted = false;
      video.controls = true;
      video.src = "media/proofline-explainer.mp4";
      player.classList.add("is-playing");
      video.play().catch(() => {});
      video.focus();
    });
  }

  /* ---------- Partner form (Formspree) ---------- */
  const form = $("partnerForm"), msg = $("formMsg");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.className = "form-msg";
    let ok = true;
    form.querySelectorAll("[required]").forEach((f) => {
      const bad = !f.checkValidity();
      f.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      msg.textContent = "Add a valid work email and store website, starting with https://.";
      msg.classList.add("err");
      return;
    }
    if (form.action.includes("YOUR_FORM_ID")) {
      msg.textContent = "Form not connected yet. Add your Formspree form ID in index.html.";
      msg.classList.add("err");
      return;
    }
    const b = form.querySelector("button");
    b.disabled = true; b.textContent = "Sending…";
    try {
      const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error();
      form.reset();
      msg.textContent = "Request sent. You’ll hear back within two business days.";
      msg.classList.add("ok");
    } catch {
      msg.textContent = "Couldn’t send the request. Check your connection, or email CONTACT_EMAIL.";
      msg.classList.add("err");
    } finally {
      b.disabled = false; b.textContent = "Request my free scan";
    }
  });

  $("year").textContent = new Date().getFullYear();
})();
