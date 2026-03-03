'use client';

interface DrawingToolbarProps {
  activeTool: 'marker' | 'polyline' | 'polygon' | null;
  isEditing: boolean;
  onToolSelect: (tool: 'marker' | 'polyline' | 'polygon' | null) => void;
}

export default function DrawingToolbar({ activeTool, isEditing, onToolSelect }: DrawingToolbarProps) {
  return null; // Will be implemented later
}
