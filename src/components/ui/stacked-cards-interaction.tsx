"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage } from "@/components/ui/optimized-image";

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
        "relative w-full h-full rounded-2xl overflow-hidden shadow-xl bg-card",
        className
      )}
    >
      {image && (
        <div className="absolute inset-0">
          <OptimizedImage
            src={image}
            alt=""
            optimizedWidth={400}
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
  currentPage = 0,
  totalPages = 1,
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
  const [isTapped, setIsTapped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Limit to maximum of 3 cards
  const limitedCards = cards.slice(0, 3);

  const hasMultiplePages = totalPages > 1;

  // Swipe handling
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold && onPrev) {
      onPrev();
    } else if (info.offset.x < -threshold && onNext) {
      onNext();
    }
  };

  // Toggle spread on tap for mobile
  const handleTap = () => {
    setIsTapped(!isTapped);
  };

  const isSpread = isHovering || isTapped;

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 py-4 sm:py-8">
      <div className="relative flex items-center gap-2 sm:gap-4 md:gap-6 w-full max-w-[90vw] sm:max-w-none justify-center">
        {/* Previous Button */}
        {showNavigation && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPrev}
            disabled={!hasMultiplePages}
            className={cn(
              "p-2 sm:p-2.5 md:p-3 rounded-full border transition-all duration-300 shadow-lg z-10 shrink-0",
              hasMultiplePages 
                ? "bg-muted/80 border-border/50 hover:border-primary/50 hover:bg-primary/10 cursor-pointer"
                : "bg-muted/30 border-border/30 cursor-not-allowed opacity-50"
            )}
            aria-label="Previous certificates"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-foreground" />
          </motion.button>
        )}

        {/* Cards Container with Swipe Support */}
        <motion.div
          ref={containerRef}
          className="relative w-56 h-36 xs:w-64 xs:h-40 sm:w-80 sm:h-52 md:w-96 md:h-64 touch-pan-y"
          drag={hasMultiplePages ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          onTap={handleTap}
        >
          {limitedCards.map((card, index) => {
            const isFirst = index === 0;

            // Responsive spread distance
            let xOffset = 0;
            let rotation = 0;
            const mobileSpread = spreadDistance * 0.6;
            const actualSpread = typeof window !== 'undefined' && window.innerWidth < 640 ? mobileSpread : spreadDistance;

            if (limitedCards.length > 1) {
              if (index === 1) {
                xOffset = -actualSpread;
                rotation = -rotationAngle;
              } else if (index === 2) {
                xOffset = actualSpread;
                rotation = rotationAngle;
              }
            }

            return (
              <motion.div
                key={index}
                className="absolute inset-0 cursor-pointer"
                initial={{ x: 0, rotate: 0, zIndex: limitedCards.length - index }}
                animate={{
                  x: isSpread ? xOffset : 0,
                  rotate: isSpread ? rotation : 0,
                  zIndex: isFirst ? limitedCards.length : limitedCards.length - index,
                  scale: isSpread ? (isFirst ? 1.02 : 0.98) : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: isSpread
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
                  <div className="w-full p-2 sm:p-3 md:p-4 bg-gradient-to-t from-background via-background/90 to-transparent">
                    <h3 className="text-xs sm:text-sm md:text-base font-semibold text-foreground line-clamp-1">
                      {card.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-1">
                      {card.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Next Button */}
        {showNavigation && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            disabled={!hasMultiplePages}
            className={cn(
              "p-2 sm:p-2.5 md:p-3 rounded-full border transition-all duration-300 shadow-lg z-10 shrink-0",
              hasMultiplePages 
                ? "bg-muted/80 border-border/50 hover:border-primary/50 hover:bg-primary/10 cursor-pointer"
                : "bg-muted/30 border-border/30 cursor-not-allowed opacity-50"
            )}
            aria-label="Next certificates"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-foreground" />
          </motion.button>
        )}
      </div>

      {/* Pagination Dots */}
      {showNavigation && hasMultiplePages && (
        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300",
                index === currentPage
                  ? "w-4 sm:w-6 bg-primary"
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}

      {/* Swipe hint for mobile */}
      {showNavigation && hasMultiplePages && (
        <p className="text-[10px] sm:text-xs text-muted-foreground/60 sm:hidden">
          Swipe to navigate
        </p>
      )}
    </div>
  );
};

export { StackedCardsInteraction, Card };
