import { BOARD_RADIUS } from "../game/constants";

export interface MissionCard {
  id: string;
  name: string;
  tone: string;
  locationLabel: string;
  /** Hex keys (q,r) for stub destinations — placed on board at setup */
  destinationKeys: string[];
  brief: string;
  complication: string;
  /** Completing a mission: TBD (reach location + resolve complication / checks). */
  completeRule: string;
}

/** Outer-ring coords scale with BOARD_RADIUS so missions stay at map edges. */
const R = BOARD_RADIUS;

/** First 5 missions from docs/missions.md */
export const MISSIONS: MissionCard[] = [
  {
    id: "M1",
    name: "Silent Relay at Station 9",
    tone: "Friendly / Mystery",
    locationLabel: "Station 9",
    destinationKeys: [`${R},${-R}`],
    brief:
      "Dock with the unpowered station, learn why the distress beacon was disabled, and restore the signal.",
    complication: "Backup power only runs life support or docking clamps—not both.",
    completeRule: "TBD — stub: land on Station 9 and claim mission (prototype).",
  },
  {
    id: "M2",
    name: "The Cold Cargo Run",
    tone: "Neutral / Smuggling",
    locationLabel: "Colony Clinic Pickup → Mining Colony Dropoff",
    destinationKeys: [`${-R},0`, `${R},0`],
    brief: "Haul cryo vaccine containers past a corporate blockade before they thaw.",
    complication: "One container's bio-signature is a stowaway witness.",
    completeRule: "TBD — stub: visit Pickup then Dropoff and claim mission (prototype).",
  },
  {
    id: "M3",
    name: "Ghost Ship on the Drift",
    tone: "Friendly / Salvage & Rescue",
    locationLabel: "Derelict survey ship",
    destinationKeys: [`${-Math.floor((R * 2) / 3)},${R}`],
    brief: "Pull the navigation core (and anyone in cryo) before the hull crushes.",
    complication: "Another ship claims salvage rights and locks weapons.",
    completeRule: "TBD — stub: land on derelict ship and claim mission (prototype).",
  },
  {
    id: "M4",
    name: "Blackout at Helios Refinery",
    tone: "Hostile / Sabotage",
    locationLabel: "Helios Refinery",
    destinationKeys: [`0,${-R}`],
    brief: "Knock out the orbital stabilizer long enough to delay a shipment—no casualties.",
    complication: "Chief engineer recognizes your ship's registry.",
    completeRule: "TBD — stub: land on Helios Refinery and claim mission (prototype).",
  },
  {
    id: "M5",
    name: "The Parley on Red Dust",
    tone: "Friendly / Diplomacy",
    locationLabel: "Red Dust",
    destinationKeys: [`${-R},${R}`],
    brief: "Host both leaders and broker a truce before gunboats arrive.",
    complication: "A listening bug makes both sides suspect you.",
    completeRule: "TBD — stub: land on Red Dust and claim mission (prototype).",
  },
];
