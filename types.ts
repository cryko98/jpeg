import React from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: Position;
  content: React.ReactNode;
  icon?: React.ReactNode;
  width?: number;
  height?: number;
}

export type WindowAction = 
  | { type: 'OPEN'; id: string }
  | { type: 'CLOSE'; id: string }
  | { type: 'MINIMIZE'; id: string }
  | { type: 'FOCUS'; id: string }
  | { type: 'MOVE'; id: string; position: Position };

export const APP_CONSTANTS = {
    CA: "X9U2efmZRvvQrGDpS2z854N43etQB2arWuJ7zCDUgif",
    TICKER: "$.gif",
    NAME: "The best .gif"
};