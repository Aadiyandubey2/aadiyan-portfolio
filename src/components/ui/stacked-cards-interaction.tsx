"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    landscape: "w-80 h-56 sm:w-[420px] sm:h-72",
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
  aspectRatio?: "portrait" | "landscape" | "square";
}

const StackedCardsInteraction = ({
  cards,
  aspectRatio = "landscape",
}: StackedCardsInteractionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerClasses = {
    portrait: "w-64 h-80 sm:w-72 sm:h-96",
    landscape: "w-80 h-56 sm:w-[420px] sm:h-72",
    square: "w-64 h-64 sm:w-80 sm:h-80",
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Card Display with Navigation */}
      <div className="flex items-center gap-4 sm:gap-8">
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrev}
          className="p-2.5 sm:p-3 rounded-full bg-muted/80 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 shadow-lg"
          aria-label="Previous certificate"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
        </motion.button>

        {/* Card Container */}
        <div className={cn("relative", containerClasses[aspectRatio])}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute inset-0 cursor-pointer"
              onClick={currentCard.onClick}
            >
              <Card 
                image={currentCard.image} 
                className="border border-border/30 hover:border-primary/50 transition-colors" 
                aspectRatio={aspectRatio}
              >
                <div className="w-full p-4 sm:p-5 bg-gradient-to-t from-background via-background/95 to-transparent">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground line-clamp-1">
                    {currentCard.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                    {currentCard.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          className="p-2.5 sm:p-3 rounded-full bg-muted/80 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 shadow-lg"
          aria-label="Next certificate"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
        </motion.button>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center gap-2">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex
                ? "w-6 bg-primary"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to certificate ${index + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="text-sm text-muted-foreground">
        {currentIndex + 1} / {cards.length}
      </p>
    </div>
  );
};

export { StackedCardsInteraction, Card };
