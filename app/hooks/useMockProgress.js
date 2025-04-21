import { useEffect, useState } from "react";

export function useMockProgress() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("mockProgress");
    if (stored) {
      setProgress(JSON.parse(stored));
    } else {
      const defaultProgress = {
        xp: 0,
        level: 1,
        streak: 0,
        achievements: [],
      };
      localStorage.setItem("mockProgress", JSON.stringify(defaultProgress));
      setProgress(defaultProgress);
    }
  }, []);

  const updateProgress = (newData) => {
    const updated = { ...progress, ...newData };
    localStorage.setItem("mockProgress", JSON.stringify(updated));
    setProgress(updated);
  };

  return [progress, updateProgress];
}
