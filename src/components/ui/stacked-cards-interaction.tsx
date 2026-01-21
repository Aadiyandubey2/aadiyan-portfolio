"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        "relative w-72 h-48 sm:w-96 sm:h-64 rounded-2xl overflow-hidden shadow-xl bg-card",
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
  spreadDistance = 40,
  rotationAngle = 5,
  animationDelay = 0.1,
  showNavigation = false,
  onPrev,
  onNext,
  currentPage,
  totalPages,
}: {
  cards: CardData[];
  spreadDistance?: number;
  rotationAngle?: number;
  animationDelay?: number;
  showNavigation?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  currentPage?: number;
  totalPages?: number;
}) => {
  const [isHovering, setIsHovering] = useState(false);

  // Limit to maximum of 3 cards
  const limitedCards = cards.slice(0, 3);

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative flex items-center gap-4 sm:gap-6">
        {/* Previous Button */}
        {showNavigation && totalPages && totalPages > 1 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPrev}
            className="p-2.5 sm:p-3 rounded-full bg-muted/80 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 shadow-lg z-10"
            aria-label="Previous certificates"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </motion.button>
        )}

        {/* Cards Container */}
        <div className="relative w-72 h-48 sm:w-96 sm:h-64">
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
                  delay: isHovering
                    ? index * animationDelay
                    : (limitedCards.length - 1 - index) * animationDelay,
                }}
                onClick={card.onClick}
                {...(isFirst && {
                  onHoverStart: () => setIsHovering(true),
                  onHoverEnd: () => setIsHovering(false),
                })}
              >
                <Card image={card.image} className="border border-border/30">
                  <div className="w-full p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-1">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      {card.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Next Button */}
        {showNavigation && totalPages && totalPages > 1 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className="p-2.5 sm:p-3 rounded-full bg-muted/80 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 shadow-lg z-10"
            aria-label="Next certificates"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </motion.button>
        )}
      </div>

      {/* Pagination Dots */}
      {showNavigation && totalPages && totalPages > 1 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentPage
                  ? "w-6 bg-primary"
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { StackedCardsInteraction, Card };
