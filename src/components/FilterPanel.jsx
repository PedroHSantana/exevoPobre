import { useState } from 'react';
import { DEFAULT_FILTERS } from '../lib/filters';
import { VOCATION_FAMILIES, SKILLS, SKILL_SHORT, WORLDS, PVP_TYPES, LOCATIONS } from '../lib/constants';

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function FilterPanel({ filters, onChange }) {
  const [timeUnit, setTimeUnit] = useState('hours');
  const set = (patch) => onChange({ ...filters, ...patch });

  const setSkillMin = (skill, value) => {
    const next = { ...filters.skillMins };
    if (value === '' || value == null) delete next[skill];
    else next[skill] = Number(value);
    set({ skillMins: next });
  };

  const setMin = (key) => (e) => set({ [key]: e.target.value ? Number(e.target.value) : null });

  const timeValue =
    filters.endingWithinMinutes == null
      ? ''
      : timeUnit === 'hours'
        ? Math.round((filters.endingWithinMinutes / 60) * 10) / 10
        : filters.endingWithinMinutes;

  const setTimeValue = (raw) => {
    if (raw === '' || raw == null) {
      set({ endingWithinMinutes: null });
      return;
    }
    const minutes = timeUnit === 'hours' ? Number(raw) * 60 : Number(raw);
    set({ endingWithinMinutes: Math.round(minutes) });
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-scroll">
        <h2>Filtros</h2>

        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar por nome do personagem"
            value={filters.characterName ?? ''}
            onChange={(e) => set({ characterName: e.target.value || null })}
          />
        </div>

        <div className="filter-grid-3">
          <div className="filter-group">
            <label>Nível min</label>
            <input type="number" placeholder="min" value={filters.levelMin ?? ''} onChange={setMin('levelMin')} />
          </div>
          <div className="filter-group">
            <label>Nível max</label>
            <input type="number" placeholder="max" value={filters.levelMax ?? ''} onChange={setMin('levelMax')} />
          </div>
          <div className="filter-group">
            <label>Bid máx.</label>
            <input type="number" placeholder="ex: 50000" value={filters.bidMax ?? ''} onChange={setMin('bidMax')} />
          </div>
        </div>

        <div className="filter-group">
          <label>Terminando em até</label>
          <div className="filter-row">
            <input type="number" step="0.5" min="0" placeholder="ex: 2" value={timeValue} onChange={(e) => setTimeValue(e.target.value)} />
            <select value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)}>
              <option value="minutes">min</option>
              <option value="hours">horas</option>
            </select>
          </div>
        </div>

        <div className="filter-group">
          <label>Vocação</label>
          <div className="chip-list">
            {VOCATION_FAMILIES.map(({ label }) => (
              <button
                key={label}
                type="button"
                className={`chip ${filters.vocations.includes(label) ? 'chip-active' : ''}`}
                onClick={() => set({ vocations: toggleValue(filters.vocations, label) })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Tipo de PvP</label>
          <div className="chip-list">
            {PVP_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`chip ${filters.pvpTypes.includes(type) ? 'chip-active' : ''}`}
                onClick={() => set({ pvpTypes: toggleValue(filters.pvpTypes, type) })}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Localidade</label>
          <div className="chip-list">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                type="button"
                className={`chip ${filters.locations.includes(loc) ? 'chip-active' : ''}`}
                onClick={() => set({ locations: toggleValue(filters.locations, loc) })}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Mundo</label>
          <select
            multiple
            value={filters.worlds}
            onChange={(e) => set({ worlds: [...e.target.selectedOptions].map((o) => o.value) })}
          >
            {WORLDS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Skills mínimas</label>
          <div className="chip-list" style={{ marginBottom: 8 }}>
            <button
              type="button"
              className={`chip ${filters.skillMinsMode === 'all' ? 'chip-active' : ''}`}
              onClick={() => set({ skillMinsMode: 'all' })}
            >
              E (todas)
            </button>
            <button
              type="button"
              className={`chip ${filters.skillMinsMode === 'any' ? 'chip-active' : ''}`}
              onClick={() => set({ skillMinsMode: 'any' })}
            >
              OU (qualquer)
            </button>
          </div>
          <div className="filter-grid-2">
            {SKILLS.map((skill) => (
              <div className="filter-row" key={skill}>
                <span className="skill-label">{SKILL_SHORT[skill]}</span>
                <input
                  type="number"
                  placeholder="min"
                  value={filters.skillMins[skill] ?? ''}
                  onChange={(e) => setSkillMin(skill, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Outros mínimos</label>
          <div className="filter-grid-2">
            <div className="filter-row">
              <span className="skill-label">Charms</span>
              <input type="number" value={filters.charmPointsMin ?? ''} onChange={setMin('charmPointsMin')} />
            </div>
            <div className="filter-row">
              <span className="skill-label">Imbuements</span>
              <input type="number" value={filters.imbuementsMin ?? ''} onChange={setMin('imbuementsMin')} />
            </div>
            <div className="filter-row">
              <span className="skill-label">Quests</span>
              <input type="number" value={filters.questsCompletedMin ?? ''} onChange={setMin('questsCompletedMin')} />
            </div>
            <div className="filter-row">
              <span className="skill-label">Boss Points</span>
              <input type="number" value={filters.bossPointsMin ?? ''} onChange={setMin('bossPointsMin')} />
            </div>
            <div className="filter-row">
              <span className="skill-label">Achievements</span>
              <input type="number" value={filters.achievementPointsMin ?? ''} onChange={setMin('achievementPointsMin')} />
            </div>
          </div>
        </div>

        <button type="button" className="btn-secondary" onClick={() => onChange(DEFAULT_FILTERS)}>
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
