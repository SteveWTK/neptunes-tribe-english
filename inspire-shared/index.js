/**
 * @inspire/shared - Shared components and utilities for INSPIRE English learning apps
 *
 * Usage:
 *   import { FeedbackWidget } from '@inspire/shared';
 *   import { AppConfigProvider, useAppConfig, useTheme } from '@inspire/shared';
 *   import { themes, defaultConfig } from '@inspire/shared/config';
 */

// Components - Feedback
export { default as FeedbackWidget } from "./components/feedback/FeedbackWidget";

// Components - Map
export { default as LocationPicker } from "./components/map/LocationPicker";
export { default as ContentPinsMap } from "./components/map/ContentPinsMap";

// Components - Games
export { default as WordSnakeLesson } from "./components/games/WordSnakeLesson";
export { default as WordSnakeOnboarding } from "./components/games/WordSnakeOnboarding";
export { default as MemoryMatchLesson } from "./components/games/MemoryMatchLesson";
export { default as InteractivePitch } from "./components/games/InteractivePitch";
export { default as InteractiveGame } from "./components/games/InteractiveGame";

// Components - UI
export { Button } from "./components/ui/Button";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/ui/Card";
export { Badge, badgeVariants } from "./components/ui/Badge";
export { Input } from "./components/ui/Input";
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./components/ui/Dialog";
export { Progress } from "./components/ui/Progress";
export { Textarea } from "./components/ui/Textarea";
export { default as VideoPlayer } from "./components/ui/VideoPlayer";
export { default as AnimatedCounter } from "./components/ui/AnimatedCounter";
export { default as AnimatedProgressBar } from "./components/ui/AnimatedProgressBar";
export { default as GlossaryTooltip } from "./components/ui/GlossaryTooltip";

// Components - Lessons
export { default as VocabularyItem } from "./components/lessons/VocabularyItem";
export { default as FloatingFacts } from "./components/lessons/FloatingFacts";

// Components - Exercises
export { default as AIGapFillExercise } from "./components/exercises/AIGapFillExercise";
export { default as AIWritingExercise } from "./components/exercises/AIWritingExercise";
export { default as AIListeningChallenge } from "./components/exercises/AIListeningChallenge";
export { default as AISpeechPractice } from "./components/exercises/AISpeechPractice";
export { default as AIConversationPractice } from "./components/exercises/AIConversationPractice";
export { default as AIMultipleChoiceGapFill } from "./components/exercises/AIMultipleChoiceGapFill";

// Config
export { themes } from "./config/themes";
export { defaultConfig } from "./config/defaultConfig";

// Context and Hooks
export {
  AppConfigProvider,
  useAppConfig,
  useTheme,
  useFeature,
} from "./lib/contexts/AppConfigContext";

// Affiliate Tracking
export { default as AffiliateTracker } from "./lib/affiliate/AffiliateTracker";
export { default as useAffiliateAttribution } from "./lib/affiliate/useAffiliateAttribution";
export {
  storeAttribution,
  getAttribution,
  clearAttribution,
  hasAttribution,
  getStripeAffiliateMetadata,
  buildAffiliateURL,
  REFERRAL_PARAMS,
  DEFAULT_ATTRIBUTION_DAYS,
} from "./lib/affiliate/affiliateUtils";
