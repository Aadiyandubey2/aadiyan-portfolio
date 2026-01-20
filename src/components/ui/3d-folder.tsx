"use client"

import { useState, useRef, forwardRef, useEffect, useLayoutEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { X, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"

interface Project {
  id: string
  image: string
  title: string
  url?: string
  description?: string
  tech_stack?: string[]
}

interface AnimatedFolderProps {
  title: string
  projects: Project[]
  className?: string
  onProjectClick?: (project: Project) => void
}

export function AnimatedFolder({ title, projects, className, onProjectClick }: AnimatedFolderProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null)
  const [hiddenCardId, setHiddenCardId] = useState<string | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleProjectClick = (project: Project, index: number) => {
    const cardEl = cardRefs.current[index]
    if (cardEl) {
      setSourceRect(cardEl.getBoundingClientRect())
    }
    setSelectedIndex(index)
    setHiddenCardId(project.id)
  }

  const handleCloseLightbox = () => {
    setSelectedIndex(null)
    setSourceRect(null)
  }

  const handleCloseComplete = () => {
    setHiddenCardId(null)
  }

  const handleNavigate = (newIndex: number) => {
    setSelectedIndex(newIndex)
    setHiddenCardId(projects[newIndex]?.id || null)
  }

  return (
    <>
      <div
        className={cn(
          "relative w-72 h-56 cursor-pointer group",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle background glow on hover */}
        <div
          className={cn(
            "absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500",
            isHovered && "opacity-100"
          )}
          style={{
            background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.15), transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        <div className="relative w-full h-full" style={{ perspective: "1000px" }}>
          {/* Folder back layer */}
          <div
            className={cn(
              "absolute inset-x-2 top-4 bottom-0 rounded-xl transition-all duration-500 ease-out",
              isHovered ? "scale-[1.02]" : ""
            )}
            style={{
              background: "hsl(var(--folder-back))",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
              zIndex: 10,
            }}
          />

          {/* Folder tab */}
          <div
            className={cn(
              "absolute left-6 top-0 w-20 h-6 rounded-t-lg transition-all duration-500",
              isHovered ? "scale-105" : ""
            )}
            style={{
              background: "hsl(var(--folder-tab))",
              boxShadow: "0 -2px 4px rgba(0,0,0,0.05)",
              zIndex: 10,
            }}
          />

          {/* Project cards */}
          <div className="absolute inset-x-4 top-8 bottom-4" style={{ zIndex: 20 }}>
            {projects.slice(0, 3).map((project, index) => (
              <ProjectCard
                key={project.id}
                ref={(el) => {
                  cardRefs.current[index] = el
                }}
                image={project.image}
                title={project.title}
                delay={index * 80}
                isVisible={isHovered}
                index={index}
                onClick={() => handleProjectClick(project, index)}
                isSelected={hiddenCardId === project.id}
              />
            ))}
          </div>

          {/* Folder front layer */}
          <div
            className={cn(
              "absolute inset-x-0 top-6 bottom-0 rounded-xl transition-all duration-500 ease-out",
              isHovered ? "translate-y-2 rotate-x-[-5deg]" : ""
            )}
            style={{
              background: "linear-gradient(180deg, hsl(var(--folder-front)) 0%, hsl(var(--folder-back)) 100%)",
              transformOrigin: "bottom center",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
              zIndex: 30,
            }}
          />

          {/* Folder shine effect */}
          <div
            className={cn(
              "absolute inset-x-0 top-6 h-12 rounded-t-xl opacity-30 transition-opacity duration-500",
              isHovered && "opacity-50"
            )}
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
              zIndex: 31,
            }}
          />
        </div>

        {/* Folder title */}
        <div
          className={cn(
            "absolute bottom-12 left-0 right-0 text-center font-heading font-bold text-foreground text-lg transition-all duration-300",
            isHovered ? "opacity-0 translate-y-2" : "opacity-100"
          )}
          style={{ zIndex: 40 }}
        >
          {title}
        </div>

        {/* Project count */}
        <div
          className={cn(
            "absolute bottom-6 left-0 right-0 text-center text-sm text-muted-foreground transition-all duration-300",
            isHovered ? "opacity-0" : "opacity-100"
          )}
          style={{ zIndex: 40 }}
        >
          {projects.length} projects
        </div>

        {/* Hover hint */}
        <div
          className={cn(
            "absolute -bottom-6 left-0 right-0 text-center text-xs text-muted-foreground/60 transition-all duration-300",
            isHovered ? "opacity-0" : "opacity-100"
          )}
        >
          Hover to explore
        </div>
      </div>

      <ImageLightbox
        projects={projects}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={handleCloseLightbox}
        sourceRect={sourceRect}
        onCloseComplete={handleCloseComplete}
        onNavigate={handleNavigate}
        onProjectClick={onProjectClick}
      />
    </>
  )
}

interface ProjectCardProps {
  image: string
  title: string
  delay: number
  isVisible: boolean
  index: number
  onClick: () => void
  isSelected: boolean
}

const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
  ({ image, title, delay, isVisible, index, onClick, isSelected }, ref) => {
    const rotations = [-12, 0, 12]
    const translations = [-55, 0, 55]

    return (
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 rounded-lg overflow-hidden cursor-pointer transition-all duration-500 ease-out",
          "border border-border/20 shadow-lg",
          isSelected && "opacity-0 pointer-events-none"
        )}
        style={{
          transform: isVisible
            ? `translateX(${translations[index]}px) rotate(${rotations[index]}deg) translateY(-20px)`
            : "translateX(0) rotate(0) translateY(0)",
          transitionDelay: `${delay}ms`,
          zIndex: 20 - index,
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-xs font-medium text-foreground truncate">{title}</p>
        </div>
      </div>
    )
  }
)

ProjectCard.displayName = "ProjectCard"

interface ImageLightboxProps {
  projects: Project[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  sourceRect: DOMRect | null
  onCloseComplete?: () => void
  onNavigate: (index: number) => void
  onProjectClick?: (project: Project) => void
}

function ImageLightbox({
  projects,
  currentIndex,
  isOpen,
  onClose,
  sourceRect,
  onCloseComplete,
  onNavigate,
  onProjectClick,
}: ImageLightboxProps) {
  const [animationPhase, setAnimationPhase] = useState<"initial" | "animating" | "complete">("initial")
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [internalIndex, setInternalIndex] = useState(currentIndex)
  const [prevIndex, setPrevIndex] = useState(currentIndex)
  const [isSliding, setIsSliding] = useState(false)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")

  const totalProjects = projects.length
  const hasNext = internalIndex < totalProjects - 1
  const hasPrev = internalIndex > 0

  const currentProject = projects[internalIndex]

  useEffect(() => {
    if (isOpen && currentIndex !== internalIndex && !isSliding) {
      const direction = currentIndex > internalIndex ? "left" : "right"
      setSlideDirection(direction)
      setPrevIndex(internalIndex)
      setIsSliding(true)

      const timer = setTimeout(() => {
        setInternalIndex(currentIndex)
        setIsSliding(false)
      }, 400)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, isOpen, internalIndex, isSliding])

  useEffect(() => {
    if (isOpen) {
      setInternalIndex(currentIndex)
      setPrevIndex(currentIndex)
      setIsSliding(false)
    }
  }, [isOpen, currentIndex])

  const navigateNext = useCallback(() => {
    if (internalIndex >= totalProjects - 1 || isSliding) return
    onNavigate(internalIndex + 1)
  }, [internalIndex, totalProjects, isSliding, onNavigate])

  const navigatePrev = useCallback(() => {
    if (internalIndex <= 0 || isSliding) return
    onNavigate(internalIndex - 1)
  }, [internalIndex, isSliding, onNavigate])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    onClose()
    setTimeout(() => {
      setIsClosing(false)
      setShouldRender(false)
      setAnimationPhase("initial")
      onCloseComplete?.()
    }, 400)
  }, [onClose, onCloseComplete])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === "Escape") handleClose()
      if (e.key === "ArrowRight") navigateNext()
      if (e.key === "ArrowLeft") navigatePrev()
    }

    window.addEventListener("keydown", handleKeyDown)
    if (isOpen) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, handleClose, navigateNext, navigatePrev])

  useLayoutEffect(() => {
    if (isOpen && sourceRect) {
      setShouldRender(true)
      setAnimationPhase("initial")
      setIsClosing(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimationPhase("animating")
        })
      })
      const timer = setTimeout(() => {
        setAnimationPhase("complete")
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isOpen, sourceRect])

  const handleDotClick = (idx: number) => {
    if (isSliding || idx === internalIndex) return
    onNavigate(idx)
  }

  if (!shouldRender || !currentProject) return null

  const getInitialStyles = (): React.CSSProperties => {
    if (!sourceRect) return {}

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const targetWidth = Math.min(768, viewportWidth - 64)
    const targetHeight = Math.min(viewportHeight * 0.85, 600)

    const targetX = (viewportWidth - targetWidth) / 2
    const targetY = (viewportHeight - targetHeight) / 2

    const scaleX = sourceRect.width / targetWidth
    const scaleY = sourceRect.height / targetHeight
    const scale = Math.max(scaleX, scaleY)

    const translateX = sourceRect.left + sourceRect.width / 2 - (targetX + targetWidth / 2)
    const translateY = sourceRect.top + sourceRect.height / 2 - (targetY + targetHeight / 2)

    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      opacity: 1,
    }
  }

  const getFinalStyles = (): React.CSSProperties => {
    return {
      transform: "translate(0, 0) scale(1)",
      opacity: 1,
    }
  }

  const currentStyles = animationPhase === "initial" && !isClosing ? getInitialStyles() : getFinalStyles()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Minimal backdrop - allows bubbles to show through */}
      <div
        className={cn(
          "absolute inset-0 bg-transparent backdrop-blur-[2px] transition-opacity duration-400",
          animationPhase !== "initial" && !isClosing ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Close button - positioned relative to the content container */}

      {/* Navigation buttons */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          navigatePrev()
        }}
        disabled={!hasPrev || isSliding}
        className={cn(
          "absolute left-4 md:left-8 z-50",
          "w-12 h-12 flex items-center justify-center",
          "rounded-full bg-muted/50 backdrop-blur-md",
          "border border-border",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          "transition-all duration-300 ease-out hover:scale-110 active:scale-95",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
        style={{
          opacity: animationPhase === "complete" && !isClosing && hasPrev ? 1 : 0,
          transform: animationPhase === "complete" && !isClosing ? "translateX(0)" : "translateX(-20px)",
          transition: "opacity 300ms ease-out 150ms, transform 300ms ease-out 150ms",
        }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          navigateNext()
        }}
        disabled={!hasNext || isSliding}
        className={cn(
          "absolute right-4 md:right-8 z-50",
          "w-12 h-12 flex items-center justify-center",
          "rounded-full bg-muted/50 backdrop-blur-md",
          "border border-border",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          "transition-all duration-300 ease-out hover:scale-110 active:scale-95",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
        style={{
          opacity: animationPhase === "complete" && !isClosing && hasNext ? 1 : 0,
          transform: animationPhase === "complete" && !isClosing ? "translateX(0)" : "translateX(20px)",
          transition: "opacity 300ms ease-out 150ms, transform 300ms ease-out 150ms",
        }}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Main content */}
      <div
        className="relative w-full max-w-3xl mx-4 rounded-2xl overflow-hidden bg-transparent border border-border/30 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          ...currentStyles,
          transform: isClosing ? "translate(0, 0) scale(0.95)" : currentStyles.transform,
          transition:
            animationPhase === "initial" && !isClosing
              ? "none"
              : "transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease-out",
          transformOrigin: "center center",
        }}
      >
        {/* Close button inside card */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className={cn(
            "absolute top-3 right-3 z-[60]",
            "w-9 h-9 flex items-center justify-center",
            "rounded-full bg-background/90 dark:bg-muted/80 backdrop-blur-sm",
            "border border-border/50 shadow-md",
            "text-foreground hover:bg-muted",
            "transition-all duration-200 ease-out hover:scale-105 active:scale-95"
          )}
        >
          <X className="w-4 h-4" />
        </button>
        {/* Image container */}
        <div className="relative aspect-video overflow-hidden">
          <div className="relative w-full h-full">
            {projects.map((project, idx) => (
              <img
                key={project.id}
                src={project.image}
                alt={project.title}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-all duration-400",
                  idx === internalIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
                )}
              />
            ))}
          </div>
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Info bar - transparent with backdrop blur */}
        <div className="p-4 sm:p-5 bg-white/80 dark:bg-black/60 backdrop-blur-md">
          <div className="flex flex-col gap-3">
            {/* Title and View button */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-heading font-bold text-gray-900 dark:text-white">
                  {currentProject?.title}
                </h3>
                {currentProject?.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {currentProject.description}
                  </p>
                )}
              </div>

              {currentProject?.url && (
                <a
                  href={currentProject.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Tech stack */}
            {currentProject?.tech_stack && currentProject.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {currentProject.tech_stack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-xs font-mono bg-gray-200/80 dark:bg-white/10 text-gray-700 dark:text-gray-200 border border-gray-300/50 dark:border-white/20"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Navigation dots */}
            <div className="flex items-center gap-4 pt-1 border-t border-gray-300/30 dark:border-white/20">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                <span className="opacity-60">←</span> <span className="opacity-60">→</span> to navigate
              </span>
              <div className="flex items-center gap-1.5">
                {projects.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDotClick(idx)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        idx === internalIndex
                          ? "bg-gray-900 dark:bg-white scale-110"
                          : "bg-gray-400/60 dark:bg-white/40 hover:bg-gray-500 dark:hover:bg-white/60"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { ImageLightbox, ProjectCard }