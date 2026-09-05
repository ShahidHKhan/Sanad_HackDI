import { useState } from 'react';
import { GUIDANCE_GUIDES } from '../data/guidance';

interface GuidanceDrawerProps {
  onClose: () => void;
}

export function GuidanceDrawer({ onClose }: GuidanceDrawerProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="guidance-overlay" onClick={onClose}>
      <aside className="guidance-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="guidance-header">
          <h2>Guidance</h2>
          <button type="button" className="icon-button" aria-label="Close guidance" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="guidance-description">
          Step-by-step notes for rites the family may need to carry out directly. This
          reflects common Sunni practice — confirm specifics with your imam or funeral
          committee before you begin.
        </p>

        <div className="guidance-list">
          {GUIDANCE_GUIDES.map((guide) => {
            const open = openIds.has(guide.id);
            return (
              <div key={guide.id} className="guidance-item">
                <button
                  type="button"
                  className="guidance-item-toggle"
                  onClick={() => toggle(guide.id)}
                >
                  <span>{guide.title}</span>
                  <span className={`guidance-chevron ${open ? 'open' : ''}`}>▾</span>
                </button>
                {open && (
                  <div className="guidance-item-content">
                    <p className="guidance-intro">{guide.intro}</p>
                    {guide.sections.map((section) => (
                      <div key={section.heading} className="guidance-section">
                        <h4>{section.heading}</h4>
                        <ol>
                          {section.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
