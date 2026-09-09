import { useState } from 'react';
import { DEFAULT_FILTERS } from '../lib/filters';
import { VOCATION_FAMILIES, SKILLS, WORLDS } from '../lib/constants';

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

  const timeValue =
    filters.endingWithinMinutes == null
      ? ''
      : timeUnit === 'hours'
        ? Math.round((filters.endingWithinMinutes / 60) * 10) / 10
        : filters.endingWithinMinutes;

  const setTimeValue = (raw, unit = timeUnit) => {
    if (raw === '' || raw == null) {
      set({ endingWithinMinutes: null });
      return;
    }
    const minutes = unit === 'hours' ? Number(raw) * 60 : Number(raw);
    set({ endingWithinMinutes: Math.round(minutes) });
  };

  return (
    <div className="filter-panel">
      <h2>Filtros</h2>

      <div className="filter-group">
        <label>Nome do personagem</label>
        <input
          type="text"
          placeholder="ex: Fulano de Tal"
          value={filters.characterName ?? ''}
          onChange={(e) => set({ characterName: e.target.value || null })}
        />
      </div>

      <div className="filter-group">
        <label>Nível</label>
        <div className="filter-row">
          <input
            type="number"
            placeholder="min"
            value={filters.levelMin ?? ''}
            onChange={(e) => set({ levelMin: e.target.value ? Number(e.target.value) : null })}
          />
          <span>—</span>
          <input
            type="number"
            placeholder="max"
            value={filters.levelMax ?? ''}
            onChange={(e) => set({ levelMax: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Bid máximo</label>
        <input
          type="number"
          placeholder="ex: 50000"
          value={filters.bidMax ?? ''}
          onChange={(e) => set({ bidMax: e.target.value ? Number(e.target.value) : null })}
        />
      </div>

      <div className="filter-group">
        <label>Terminando em até</label>
        <div className="filter-row">
          <input
            type="number"
            step="0.5"
            min="0"
            placeholder="ex: 2"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
          />
          <select value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)}>
            <option value="minutes">minutos</option>
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
            OU (qualquer uma)
          </button>
        </div>
        {SKILLS.map((skill) => (
          <div className="filter-row" key={skill}>
            <span className="skill-label">{skill}</span>
            <input
              type="number"
              placeholder="min"
              value={filters.skillMins[skill] ?? ''}
              onChange={(e) => setSkillMin(skill, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="filter-group">
        <label>Charm Points mínimo</label>
        <input
          type="number"
          value={filters.charmPointsMin ?? ''}
          onChange={(e) => set({ charmPointsMin: e.target.value ? Number(e.target.value) : null })}
        />
      </div>

      <div className="filter-group">
        <label>Imbuements mínimos</label>
        <input
          type="number"
          value={filters.imbuementsMin ?? ''}
          onChange={(e) => set({ imbuementsMin: e.target.value ? Number(e.target.value) : null })}
        />
      </div>

      <div className="filter-group">
        <label>Quests completas (mínimo)</label>
        <input
          type="number"
          value={filters.questsCompletedMin ?? ''}
          onChange={(e) => set({ questsCompletedMin: e.target.value ? Number(e.target.value) : null })}
        />
      </div>

      <div className="filter-group">
        <label>Boss Points mínimo</label>
        <input
          type="number"
          value={filters.bossPointsMin ?? ''}
          onChange={(e) => set({ bossPointsMin: e.target.value ? Number(e.target.value) : null })}
        />
      </div>

      <div className="filter-group">
        <label>Achievement Points mínimo</label>
        <input
          type="number"
          value={filters.achievementPointsMin ?? ''}
          onChange={(e) => set({ achievementPointsMin: e.target.value ? Number(e.target.value) : null })}
        />
      </div>

      <button type="button" className="btn-secondary" onClick={() => onChange(DEFAULT_FILTERS)}>
        Limpar filtros
      </button>
    </div>
  );
}
