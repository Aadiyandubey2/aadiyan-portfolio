import { memo } from "react";
import { motion } from "framer-motion";
import { ClementinePersona } from "../types";
import { PERSONA_INFO } from "../constants";

interface PersonaSelectorProps {
  currentPersona: ClementinePersona;
  unlockedPersonas: ClementinePersona[];
  onSelect: (persona: ClementinePersona) => void;
  onClose: () => void;
}

const allPersonas: ClementinePersona[] = [
  "default", "playful", "professional", "mentor", "creative", "zen", "debug", "hype"
];

export const PersonaSelector = memo(({ 
  currentPersona, 
  unlockedPersonas, 
  onSelect, 
  onClose 
}: PersonaSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-primary/10 bg-muted/30 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Choose Persona</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {allPersonas.map((persona) => {
            const info = PERSONA_INFO[persona];
            const isUnlocked = unlockedPersonas.includes(persona);
            const isCurrent = persona === currentPersona;
            
            return (
              <motion.button
                key={persona}
                whileHover={isUnlocked ? { scale: 1.02 } : undefined}
                whileTap={isUnlocked ? { scale: 0.98 } : undefined}
                onClick={() => isUnlocked && onSelect(persona)}
                disabled={!isUnlocked}
                className={`
                  relative p-3 rounded-xl text-left transition-all
                  ${isCurrent 
                    ? "bg-primary/20 border-2 border-primary" 
                    : isUnlocked 
                      ? "bg-background/50 border border-primary/20 hover:border-primary/40" 
                      : "bg-muted/50 border border-muted opacity-60 cursor-not-allowed"
                  }
                `}
              >
                <div className="text-2xl mb-1">{info.emoji}</div>
                <div className="text-xs font-medium text-foreground truncate">
                  {info.name}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {isUnlocked ? info.description : `Unlock at Level ${info.unlockLevel}`}
                </div>
                
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 text-xs">🔒</div>
                )}
                {isCurrent && (
                  <div className="absolute top-2 right-2 text-xs text-primary">✓</div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
});

PersonaSelector.displayName = "PersonaSelector";
