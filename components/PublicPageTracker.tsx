"use client";

import { useEffect } from 'react';
import { recordPageView } from '@/lib/projects';

export default function PublicPageTracker({ projectId }: { projectId?: string }) {
  useEffect(() => {
    if (projectId) {
      recordPageView(projectId);
    }
  }, [projectId]);

  return null;
}
