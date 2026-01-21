"use client";

import React, { createContext, useContext } from "react";

const DictionaryContext = createContext<any>(null);

export function DictionaryProvider({ dict, children }: { dict: any; children: React.ReactNode }) {
  return <DictionaryContext.Provider value={dict}>{children}</DictionaryContext.Provider>;
}

export function useDict() {
  const ctx = useContext(DictionaryContext);
  if (!ctx) {
    throw new Error("useDict must be used within a DictionaryProvider");
  }
  return ctx;
}

export default DictionaryContext;
