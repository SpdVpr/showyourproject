import { Project } from '@/types';

/**
 * Converts Firebase Timestamp objects to plain Date objects for client components
 */
export function serializeProject(project: Project): Project {
  return {
    ...project,
    createdAt: project.createdAt?.toDate?.() || project.createdAt,
    updatedAt: project.updatedAt?.toDate?.() || project.updatedAt,
    approvedAt: project.approvedAt?.toDate?.() || project.approvedAt,
    submittedAt: project.submittedAt?.toDate?.() || project.submittedAt,
    featuredUntil: project.featuredUntil?.toDate?.() || project.featuredUntil,
    featuredPurchasedAt: project.featuredPurchasedAt?.toDate?.() || project.featuredPurchasedAt,
  };
}

/**
 * Serializes an array of projects
 */
export function serializeProjects(projects: Project[]): Project[] {
  return projects.map(serializeProject);
}

/**
 * Generic function to serialize any object with Firebase Timestamps
 */
export function serializeFirebaseObject<T extends Record<string, any>>(obj: T): T {
  const serialized = { ...obj };
  
  // Convert all Firebase Timestamp fields to Date objects
  Object.keys(serialized).forEach(key => {
    const value = serialized[key];
    if (value && typeof value === 'object' && value.toDate) {
      serialized[key] = value.toDate();
    }
  });
  
  return serialized;
}
