import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../types/game';
import { CardView } from './CardView';

interface HandAreaProps {
  hand: Card[];
  currentEnergy: number;
  onPlayCard: (cardId: string) => void;
}

export const HandArea: React.FC<HandAreaProps> = ({ hand, currentEnergy, onPlayCard }) => {
  return (
    <div className="flex w-full items-end justify-center gap-3 overflow-x-auto px-4 py-3">
      {hand.length === 0 && (
        <motion.div
          className="rounded-xl border border-dashed border-slate-600 px-4 py-2 text-xs text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          손패가 없습니다. 다음 턴에 카드를 드로우합니다.
        </motion.div>
      )}
      <AnimatePresence mode="popLayout">
        {hand.map((card, index) => (
          <motion.div
            key={card.id}
            className="min-w-[140px] max-w-[140px]"
            initial={{ opacity: 0, y: 50, rotateY: -90 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <CardView
              card={card}
              disabled={card.cost > currentEnergy}
              onPlay={() => onPlayCard(card.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};



