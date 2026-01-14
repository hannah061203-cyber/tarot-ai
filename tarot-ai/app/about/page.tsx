"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function TarotPicker({ onSelect }: { onSelect: (cards: number[]) => void }) {
  const totalCards = 86;
  const [selected, setSelected] = useState<number[]>([]);

  const handleSelect = (index: number) => {
    // 不能选择超过 3 张
    if (selected.includes(index)) {
      // 再次点击取消选择
      setSelected(selected.filter((i) => i !== index));
      return;
    }
    if (selected.length >= 3) return;

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 3) {
      onSelect(newSelected);
    }
  };

  return (
    <div className="w-full overflow-x-auto py-6">
      <div className="flex gap-3 min-w-max px-4">
        {[...Array(totalCards)].map((_, idx) => {
          const isSelected = selected.includes(idx);

          return (
            <motion.div
              key={idx}
              onClick={() => handleSelect(idx)}
              className="relative cursor-pointer"
              initial={{ y: 0 }}
              animate={{ y: isSelected ? -20 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              <motion.img
                src="/cards/back.png"   // 你的卡背图
                alt="card-back"
                className={`w-24 h-40 object-cover rounded-xl shadow-md border 
                  ${isSelected ? "border-purple-500 shadow-purple-300" : "border-transparent"}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
