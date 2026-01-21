"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

const Card = ({
  className,
  image,
  children,
}: {
  className?: string;
  image?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "relative w-72 h-96 rounded-2xl overflow-hidden shadow-xl",
        className
      )}
    >
      {image && (
        <div className="absolute inset-0">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {children && (
        <div className="absolute inset-0 flex items-end">
          {children}
        </div>
      )}
    </div>
  );
};

interface CardData {
  image: string;
  title: string;
  description: string;
  onClick?: () => void;
}

const StackedCardsInteraction = ({
  cards,
  spreadDistance = 50,
  rotationAngle = 8,
  animationDelay = 0.1,
}: {
  cards: CardData[];
  spreadDistance?: number;
  rotationAngle?: number;
  animationDelay?: number;
}) => {
  const [isHovering, setIsHovering] = useState(false);

  // Limit to maximum of 3 cards
  const limitedCards = cards.slice(0, 3);

  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative w-72 h-96">
        {limitedCards.map((card, index) => {
          const isFirst = index === 0;

          let xOffset = 0;
          let rotation = 0;

          if (limitedCards.length > 1) {
            // First card stays in place
            // Second card goes left
            // Third card goes right
            if (index === 1) {
              xOffset = -spreadDistance;
              rotation = -rotationAngle;
            } else if (index === 2) {
              xOffset = spreadDistance;
              rotation = rotationAngle;
            }
          }

          return (
            <motion.div
              key={index}
              className="absolute inset-0 cursor-pointer"
              initial={{ x: 0, rotate: 0, zIndex: limitedCards.length - index }}
              animate={{
                x: isHovering ? xOffset : 0,
                rotate: isHovering ? rotation : 0,
                zIndex: isFirst ? limitedCards.length : limitedCards.length - index,
                scale: isHovering ? (isFirst ? 1.05 : 0.95) : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: isHovering ? index * animationDelay : (limitedCards.length - 1 - index) * animationDelay,
              }}
              onClick={card.onClick}
              {...(isFirst && {
                onHoverStart: () => setIsHovering(true),
                onHoverEnd: () => setIsHovering(false),
              })}
            >
              <Card image={card.image} className="border border-border/30">
                <div className="w-full p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
                  <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {card.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export { StackedCardsInteraction, Card };
