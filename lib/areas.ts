/**
 * Approximate centroids for every area the map recognises, used to place an
 * area-level pin when a precise address could not be geocoded. Coordinates are
 * neighbourhood centres, not company addresses — entries placed this way are
 * always tagged `pinType: "area"` so the UI can say so.
 */
export const AREA_CENTROIDS: Record<string, [number, number]> = {
  "SG Highway": [23.033, 72.507],
  Satellite: [23.03, 72.517],
  "Prahlad Nagar": [23.0106, 72.5083],
  Bodakdev: [23.0395, 72.5066],
  Navrangpura: [23.0367, 72.5601],
  "Ashram Road": [23.0316, 72.5714],
  "CG Road": [23.028, 72.561],
  Vastrapur: [23.0369, 72.5297],
  "Science City": [23.0778, 72.5029],
  Gandhinagar: [23.2156, 72.6369],
  Sanand: [22.988, 72.382],
  "GIFT City": [23.1602, 72.6844],
  Bopal: [23.03, 72.47],
  "South Bopal": [23.018, 72.465],
  Thaltej: [23.047, 72.51],
  Gurukul: [23.045, 72.539],
  Maninagar: [22.996, 72.602],
  Ellisbridge: [23.023, 72.568],
  Paldi: [23.011, 72.565],
  Ambawadi: [23.017, 72.549],
  Memnagar: [23.053, 72.542],
  "IIM Road": [23.0345, 72.536],
  "University Area": [23.037, 72.548],
  Other: [23.0225, 72.5714],
};

/**
 * Alternative spellings and nearby localities that should collapse onto one of
 * the canonical areas above. Keys are lowercased; matching is substring-based
 * against a free-text address, longest key first so "south bopal" beats "bopal".
 */
export const AREA_ALIASES: Record<string, string> = {
  "s g highway": "SG Highway",
  "s.g. highway": "SG Highway",
  "sarkhej gandhinagar": "SG Highway",
  sarkhej: "SG Highway",
  makarba: "SG Highway",
  "sindhu bhavan": "Bodakdev",
  "shilaj": "Bopal",
  "ghuma": "South Bopal",
  "jodhpur": "Satellite",
  "shivranjani": "Satellite",
  "anand nagar": "Prahlad Nagar",
  "iscon": "SG Highway",
  "nehru nagar": "Ambawadi",
  "panjra pol": "Ambawadi",
  "gulbai tekra": "Ambawadi",
  "law garden": "Ellisbridge",
  "c g road": "CG Road",
  "c.g. road": "CG Road",
  "commerce six": "Navrangpura",
  "ashram rd": "Ashram Road",
  "usmanpura": "Ashram Road",
  "stadium": "Navrangpura",
  "drive in": "Memnagar",
  "sola": "Science City",
  "gota": "Science City",
  "chandkheda": "Gandhinagar",
  "motera": "Gandhinagar",
  "raisan": "Gandhinagar",
  "kudasan": "Gandhinagar",
  "infocity": "Gandhinagar",
  "gift": "GIFT City",
  "changodar": "Sanand",
  "bavla": "Sanand",
  "dholka": "Other",
  "naroda": "Other",
  "vatva": "Other",
  "odhav": "Other",
  "isanpur": "Maninagar",
  "ghodasar": "Maninagar",
  "vasna": "Paldi",
  "iim": "IIM Road",
  "gujarat university": "University Area",
  "vastrapur lake": "Vastrapur",
};
