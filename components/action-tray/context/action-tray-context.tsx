import React, { createContext, useContext, useRef, useState, ReactNode } from "react";
import { ActionTray, ActionTrayRef } from "@/components/action-tray";

type ActionTrayContextType = {
  openTray: (step: number, dynamicContentMap?: Record<number, ReactNode>) => void;
  closeTray: () => void;
};

const ActionTrayContext = createContext<ActionTrayContextType | undefined>(
  undefined
);

export const useActionTray = () => {
  const context = useContext(ActionTrayContext);
  if (!context) {
    throw new Error("useActionTray must be used within an ActionTrayProvider");
  }
  return context;
};

export const ActionTrayProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const trayRef = useRef<ActionTrayRef>(null);
  const [contentMap, setContentMap] = useState<Record<number, ReactNode>>({});
  const [step, setStep] = useState(0);

  const openTray = (step: number, dynamicContentMap?: Record<number, ReactNode>) => {
    if (dynamicContentMap) {
      setContentMap(dynamicContentMap);
    }
    setStep(step);
    trayRef.current?.open();
  };

  const closeTray = () => {
    trayRef.current?.close();
    setStep(0);
  };

  return (
    <ActionTrayContext.Provider value={{ openTray, closeTray }}>
      {children}
      <ActionTray
        ref={trayRef}
        step={step}
        contentMap={contentMap}
        onClose={closeTray}
      />
    </ActionTrayContext.Provider>
  );
};
