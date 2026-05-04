const LEFT_RE =
  /turn\s+(sharp\s+)?left|bear\s+left|keep\s+left|slight\s+left|exit\s+left|take\s+the\s+left/i;
const RIGHT_RE =
  /turn\s+(sharp\s+)?right|bear\s+right|keep\s+right|slight\s+right|exit\s+right|take\s+the\s+right/i;
const UTURN_RE = /u[\s-]?turn|make\s+a\s+u/i;

/**
 * Replace compass-style wording with plain-language continuation (straight).
 */
function softenCompassPhrasing(text) {
  if (!text) return "";
  let out = text;

  out = out.replace(/\bhead\s+north(?:east|west)?\b/gi, "Continue straight");
  out = out.replace(/\bhead\s+south(?:east|west)?\b/gi, "Continue straight");
  out = out.replace(/\bhead\s+east\b/gi, "Continue straight");
  out = out.replace(/\bhead\s+west\b/gi, "Continue straight");

  out = out.replace(/\bnortheast\b/gi, "");
  out = out.replace(/\bnorthwest\b/gi, "");
  out = out.replace(/\bsoutheast\b/gi, "");
  out = out.replace(/\bsouthwest\b/gi, "");

  out = out.replace(/\bnorth\b/gi, "straight");
  out = out.replace(/\bsouth\b/gi, "straight");
  out = out.replace(/\beast\b/gi, "straight");
  out = out.replace(/\bwest\b/gi, "straight");

  out = out.replace(/\s{2,}/g, " ").trim();
  out = out.replace(/^straight\s+on\b/i, "Continue on");
  return out;
}

/**
 * Maps Mapbox-style maneuver text to Left | Right | Straight (+ optional U-turn).
 */
export function getStepPresentation(rawInstruction) {
  const original = (rawInstruction || "").trim();
  const lower = original.toLowerCase();

  let kind = "straight";
  if (UTURN_RE.test(lower)) kind = "uturn";
  else if (LEFT_RE.test(lower)) kind = "left";
  else if (RIGHT_RE.test(lower)) kind = "right";

  const friendlyText = softenCompassPhrasing(original);

  const labels = {
    left: "Left",
    right: "Right",
    straight: "Straight",
    uturn: "Turn around",
  };

  const arrows = {
    left: "←",
    right: "→",
    straight: "↑",
    uturn: "⇅",
  };

  return {
    kind,
    label: labels[kind],
    arrow: arrows[kind],
    instructionText: friendlyText || labels.straight,
  };
}
