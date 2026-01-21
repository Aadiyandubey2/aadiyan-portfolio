"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

interface CardProps {
  className?: string;
  image?: string;
  children?: React.ReactNode;
  aspectRatio?: "portrait" | "landscape" | "square";
}

const Card = ({
  className,
  image,
  children,
  aspectRatio = "landscape",
}: CardProps) => {
  const aspectClasses = {
    portrait: "w-64 h-80 sm:w-72 sm:h-96",
    landscape: "w-80 h-56 sm:w-96 sm:h-64",
    square: "w-64 h-64 sm:w-80 sm:h-80",
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden shadow-xl",
        aspectClasses[aspectRatio],
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

interface StackedCardsInteractionProps {
  cards: CardData[];
  spreadDistance?: number;
  rotationAngle?: number;
  animationDelay?: number;
  aspectRatio?: "portrait" | "landscape" | "square";
}

const StackedCardsInteraction = ({
  cards,
  spreadDistance = 50,
  rotationAngle = 8,
  animationDelay = 0.1,
  aspectRatio = "landscape",
}: StackedCardsInteractionProps) => {
  const [isHovering, setIsHovering] = useState(false);

  // Limit to maximum of 3 cards
  const limitedCards = cards.slice(0, 3);

  const containerClasses = {
    portrait: "w-64 h-80 sm:w-72 sm:h-96",
    landscape: "w-80 h-56 sm:w-96 sm:h-64",
    square: "w-64 h-64 sm:w-80 sm:h-80",
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className={cn("relative", containerClasses[aspectRatio])}>
        {limitedCards.map((card, index) => {
          const isFirst = index === 0;

          let xOffset = 0;
          let rotation = 0;

          if (limitedCards.length > 1) {
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
                scale: isHovering ? (isFirst ? 1.02 : 0.98) : 1,
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
              <Card image={card.image} className="border border-border/30" aspectRatio={aspectRatio}>
                <div className="w-full p-3 sm:p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
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
