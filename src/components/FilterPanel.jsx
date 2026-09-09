import { DEFAULT_FILTERS } from '../lib/filters';
import { VOCATIONS, SKILLS, WORLDS } from '../lib/constants';

function toggleValue(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function FilterPanel({ filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  const setSkillMin = (skill, value) => {
    const next = { ...filters.skillMins };
    if (value === '' || value == null) delete next[skill];
    else next[skill] = Number(value);
    set({ skillMins: next });
  };

  return (
    <div className="filter-panel">
      <h2>Filtros</h2>

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
        <label>Vocação</label>
        <div className="chip-list">
          {VOCATIONS.map((v) => (
            <button
              key={v}
              type="button"
              className={`chip ${filters.vocations.includes(v) ? 'chip-active' : ''}`}
              onClick={() => set({ vocations: toggleValue(filters.vocations, v) })}
            >
              {v}
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
