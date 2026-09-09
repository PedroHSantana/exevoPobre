// Grouped by vocation family (base + promoted) so filtering by "Knight"
// matches both "Knight" and "Elite Knight" characters, same as most players
// mean when they say "quero um knight" — promotion status is a separate
// concern, not a different class.
export const VOCATION_FAMILIES = [
  { label: 'None', vocations: ['None'] },
  { label: 'Druid', vocations: ['Druid', 'Elder Druid'] },
  { label: 'Knight', vocations: ['Knight', 'Elite Knight'] },
  { label: 'Paladin', vocations: ['Paladin', 'Royal Paladin'] },
  { label: 'Sorcerer', vocations: ['Sorcerer', 'Master Sorcerer'] },
  { label: 'Monk', vocations: ['Monk', 'Exalted Monk'] },
];

export const SKILLS = [
  'Magic Level',
  'Axe Fighting',
  'Club Fighting',
  'Sword Fighting',
  'Distance Fighting',
  'Fist Fighting',
  'Shielding',
  'Fishing',
];

export const SKILL_SHORT = {
  'Magic Level': 'Magic',
  'Axe Fighting': 'Axe',
  'Club Fighting': 'Club',
  'Sword Fighting': 'Sword',
  'Distance Fighting': 'Distance',
  'Fist Fighting': 'Fist',
  Shielding: 'Shielding',
  Fishing: 'Fishing',
};

export const VOCATION_ICON = {
  None: '❔',
  Druid: '🌿',
  'Elder Druid': '🌿',
  Knight: '⚔️',
  'Elite Knight': '⚔️',
  Paladin: '🏹',
  'Royal Paladin': '🏹',
  Sorcerer: '🔮',
  'Master Sorcerer': '🔮',
  Monk: '👊',
  'Exalted Monk': '👊',
};

export const SKILL_ICON = {
  'Magic Level': '🔮',
  'Axe Fighting': '🪓',
  'Club Fighting': '🔨',
  'Sword Fighting': '⚔️',
  'Distance Fighting': '🏹',
  'Fist Fighting': '👊',
  Shielding: '🛡️',
  Fishing: '🎣',
};

export const PVP_ICON = {
  Open: '🟢',
  Optional: '🟡',
  Hardcore: '🔴',
  'Retro Open': '🕰️',
  'Retro Hardcore': '🕰️',
};

export const LOCATION_ICON = {
  'North America': '🌎',
  'South America': '🌎',
  Europe: '🌍',
  Oceania: '🌏',
};

export const WORLDS = [
  'Aethera', 'Antica', 'Astera', 'Belobra', 'Blumera', 'Bona', 'Bravoria', 'Calmera',
  'Cantabra', 'Celebra', 'Celesta', 'Citra', 'Collabra', 'Descubra', 'Dia', 'Dracobra',
  'Eclipta', 'Epoca', 'Escura', 'Etebra', 'Ferobra', 'Firmera', 'Floribra', 'Gentebra',
  'Gladera', 'Gladibra', 'Harmonia', 'Havera', 'Honbra', 'Hostera', 'Idyllia', 'Ignibra',
  'Ignitera', 'Inabra', 'Issobra', 'Jadebra', 'Jinxibra', 'Junera', 'Kalanta', 'Kalibra',
  'Kalimera', 'Kanda', 'Karmeya', 'Lobera', 'Luminera', 'Lutabra', 'Luzibra', 'Maligna',
  'Menera', 'Monstera', 'Monza', 'Mystera', 'Nefera', 'Nevia', 'Noctalia', 'Oceanis',
  'Ombra', 'Opulera', 'Ourobra', 'Pacera', 'Peloria', 'Penumbra', 'Premia', 'Quelibra',
  'Quidera', 'Quintera', 'Rasteibra', 'Refugia', 'Retalia', 'Secura', 'Serdebra', 'Sinistra',
  'Solidera', 'Sombra', 'Sonira', 'Stralis', 'Talera', 'Tempestera', 'Terribra', 'Thyria',
  'Tornabra', 'Unebra', 'Ustebra', 'Venebra', 'Victoris', 'Vunira', 'Wickera', 'Wintera',
  'Xybra', 'Xyla', 'Xymera', 'Yonabra', 'Yovera', 'Yubra', 'Zuna', 'Zunera',
];
