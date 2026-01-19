import { useState, useEffect, useCallback } from "react";
import { 
  UserRelationship, 
  Achievement, 
  ClementinePersona,
  ClementineMood 
} from "../types";
import { 
  XP_PER_MESSAGE, 
  XP_PER_VOICE_CHAT, 
  XP_PER_SECRET, 
  XP_PER_EASTER_EGG,
  XP_PER_ACHIEVEMENT,
  LEVEL_THRESHOLDS,
  LEVEL_TITLES,
  ACHIEVEMENTS,
  TIME_BASED_MOODS,
} from "../constants";

const STORAGE_KEY = "clementine_relationship";

const generateVisitorId = () => {
  return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createDefaultRelationship = (): UserRelationship => ({
  visitorId: generateVisitorId(),
  level: 0,
  xp: 0,
  totalMessages: 0,
  firstVisit: new Date(),
  lastVisit: new Date(),
  achievements: [],
  unlockedPersonas: ["default", "playful"],
  unlockedSecrets: [],
  favoriteTopics: [],
  streak: {
    current: 0,
    longest: 0,
    lastDate: "",
  },
  stats: {
    questionsAsked: 0,
    projectsDiscussed: 0,
    voiceChatsHad: 0,
    secretsFound: 0,
    easterEggsTriggered: 0,
  },
});

export const useRelationship = () => {
  const [relationship, setRelationship] = useState<UserRelationship>(createDefaultRelationship());
  const [currentMood, setCurrentMood] = useState<ClementineMood>("happy");
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Load relationship from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.firstVisit = new Date(parsed.firstVisit);
        parsed.lastVisit = new Date(parsed.lastVisit);
        parsed.achievements = parsed.achievements.map((a: Achievement) => ({
          ...a,
          unlockedAt: new Date(a.unlockedAt),
        }));
        
        setRelationship(parsed);
        updateStreak(parsed);
      } catch (e) {
        console.error("Failed to parse relationship data:", e);
      }
    }

    // Set mood based on time
    updateMoodByTime();
  }, []);

  // Save relationship to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(relationship));
  }, [relationship]);

  const updateMoodByTime = useCallback(() => {
    const hour = new Date().getHours();
    let timeOfDay: string;
    
    if (hour >= 5 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 21) timeOfDay = "evening";
    else if (hour >= 21 || hour < 2) timeOfDay = "night";
    else timeOfDay = "lateNight";

    setCurrentMood(TIME_BASED_MOODS[timeOfDay]);
  }, []);

  const updateStreak = useCallback((rel: UserRelationship) => {
    const today = new Date().toDateString();
    const lastDate = rel.streak.lastDate;
    
    if (lastDate === today) return; // Already visited today
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate === yesterday.toDateString()) {
      // Continue streak
      setRelationship(prev => ({
        ...prev,
        streak: {
          current: prev.streak.current + 1,
          longest: Math.max(prev.streak.longest, prev.streak.current + 1),
          lastDate: today,
        },
      }));
      
      // Check streak achievements
      if (rel.streak.current + 1 >= 7) {
        unlockAchievement("streak-master");
      }
    } else if (lastDate !== today) {
      // Reset streak
      setRelationship(prev => ({
        ...prev,
        streak: {
          current: 1,
          longest: prev.streak.longest,
          lastDate: today,
        },
      }));
    }
  }, []);

  const calculateLevel = useCallback((xp: number): number => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) return i;
    }
    return 0;
  }, []);

  const addXP = useCallback((amount: number) => {
    setRelationship(prev => {
      const newXP = prev.xp + amount;
      const oldLevel = prev.level;
      const newLevel = calculateLevel(newXP);
      
      if (newLevel > oldLevel) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
        
        // Unlock personas based on level
        const newPersonas = [...prev.unlockedPersonas];
        if (newLevel >= 2 && !newPersonas.includes("professional")) newPersonas.push("professional");
        if (newLevel >= 3 && !newPersonas.includes("mentor")) newPersonas.push("mentor");
        if (newLevel >= 4 && !newPersonas.includes("creative") && !newPersonas.includes("zen")) {
          newPersonas.push("creative", "zen");
        }
        if (newLevel >= 5 && !newPersonas.includes("debug")) newPersonas.push("debug");
        if (newLevel >= 6 && !newPersonas.includes("hype")) newPersonas.push("hype");
        
        // Check level achievements
        if (newLevel >= 5) unlockAchievement("true-friend");
        if (newLevel >= 10) unlockAchievement("legend");
        
        return {
          ...prev,
          xp: newXP,
          level: newLevel,
          unlockedPersonas: newPersonas,
        };
      }
      
      return { ...prev, xp: newXP };
    });
  }, [calculateLevel]);

  const unlockAchievement = useCallback((achievementId: string) => {
    setRelationship(prev => {
      if (prev.achievements.some(a => a.id === achievementId)) return prev;
      
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) return prev;
      
      const newAchievementInstance = {
        ...achievement,
        unlockedAt: new Date(),
      };
      
      setNewAchievement(newAchievementInstance);
      setTimeout(() => setNewAchievement(null), 4000);
      
      return {
        ...prev,
        achievements: [...prev.achievements, newAchievementInstance],
        xp: prev.xp + XP_PER_ACHIEVEMENT,
      };
    });
  }, []);

  const recordMessage = useCallback(() => {
    addXP(XP_PER_MESSAGE);
    setRelationship(prev => ({
      ...prev,
      totalMessages: prev.totalMessages + 1,
      lastVisit: new Date(),
    }));
    
    // Check message count achievements
    if (relationship.totalMessages + 1 === 1) {
      unlockAchievement("first-chat");
    }
    if (relationship.stats.questionsAsked + 1 >= 10) {
      unlockAchievement("curious-mind");
    }
    if (relationship.totalMessages + 1 >= 50) {
      unlockAchievement("chatterbox");
    }
    
    // Time-based achievements
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      unlockAchievement("night-owl");
    }
    if (hour >= 5 && hour < 7) {
      unlockAchievement("early-bird");
    }
  }, [addXP, unlockAchievement, relationship]);

  const recordVoiceChat = useCallback(() => {
    addXP(XP_PER_VOICE_CHAT);
    setRelationship(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        voiceChatsHad: prev.stats.voiceChatsHad + 1,
      },
    }));
    
    if (relationship.stats.voiceChatsHad + 1 >= 5) {
      unlockAchievement("voice-explorer");
    }
  }, [addXP, unlockAchievement, relationship]);

  const recordEasterEgg = useCallback((eggId: string) => {
    addXP(XP_PER_EASTER_EGG);
    setRelationship(prev => ({
      ...prev,
      unlockedSecrets: [...new Set([...prev.unlockedSecrets, eggId])],
      stats: {
        ...prev.stats,
        easterEggsTriggered: prev.stats.easterEggsTriggered + 1,
      },
    }));
    
    if (!relationship.unlockedSecrets.includes(eggId)) {
      unlockAchievement("secret-finder");
    }
  }, [addXP, unlockAchievement, relationship]);

  const recordSecret = useCallback(() => {
    addXP(XP_PER_SECRET);
    setRelationship(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        secretsFound: prev.stats.secretsFound + 1,
      },
    }));
  }, [addXP]);

  const setNickname = useCallback((nickname: string) => {
    setRelationship(prev => ({
      ...prev,
      nickname,
    }));
  }, []);

  const recordLanguageSwitch = useCallback(() => {
    unlockAchievement("multilingual");
  }, [unlockAchievement]);

  const isPersonaUnlocked = useCallback((persona: ClementinePersona) => {
    return relationship.unlockedPersonas.includes(persona);
  }, [relationship.unlockedPersonas]);

  const getLevelTitle = useCallback(() => {
    return LEVEL_TITLES[relationship.level] || LEVEL_TITLES[0];
  }, [relationship.level]);

  const getXPProgress = useCallback(() => {
    const currentThreshold = LEVEL_THRESHOLDS[relationship.level] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[relationship.level + 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const progress = relationship.xp - currentThreshold;
    const required = nextThreshold - currentThreshold;
    return { progress, required, percentage: Math.min(100, (progress / required) * 100) };
  }, [relationship]);

  const isReturningUser = useCallback(() => {
    return relationship.totalMessages > 0;
  }, [relationship.totalMessages]);

  const changeMood = useCallback((mood: ClementineMood) => {
    setCurrentMood(mood);
  }, []);

  return {
    relationship,
    currentMood,
    showLevelUp,
    newAchievement,
    recordMessage,
    recordVoiceChat,
    recordEasterEgg,
    recordSecret,
    setNickname,
    recordLanguageSwitch,
    isPersonaUnlocked,
    getLevelTitle,
    getXPProgress,
    isReturningUser,
    changeMood,
    unlockAchievement,
  };
};
