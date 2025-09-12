import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Project, User, PointsTransaction, FeaturedSlot, POINTS_CONFIG, Message, Conversation } from '@/types';
import { dataCache, CACHE_KEYS, CACHE_TTL, withCache, withDynamicCache, invalidateCache } from './cache';
import { socialMediaManager } from './socialMediaService';

// Project Services
export const projectService = {
  // Get all projects (approved only)
  async getProjects(limitCount = 50) {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  },

  // Get all projects (all statuses - admin only)
  async getAllProjects() {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  },

  // Clean up expired featured projects
  async cleanupExpiredFeatured() {
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('featured', '==', true)
      );
      const snapshot = await getDocs(q);

      const now = new Date();
      const batch = writeBatch(db);
      let cleanedCount = 0;

      snapshot.docs.forEach(doc => {
        const project = doc.data() as Project;

        // Skip admin featured projects (no expiration)
        if (project.featuredBy === 'admin') return;

        // Check if project has expired
        if (project.featuredUntil) {
          const expiresAt = project.featuredUntil.toDate ? project.featuredUntil.toDate() : new Date(project.featuredUntil);
          if (expiresAt <= now) {
            // Remove featured status
            batch.update(doc.ref, {
              featured: false,
              featuredUntil: null,
              featuredBy: null,
              featuredPurchasedAt: null
            });
            cleanedCount++;
          }
        }
      });

      if (cleanedCount > 0) {
        await batch.commit();
        console.log(`Cleaned up ${cleanedCount} expired featured projects`);

        // Clear cache to refresh featured projects
        cache.delete(CACHE_KEYS.FEATURED_PROJECTS);
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired featured projects:', error);
      return 0;
    }
  },

  // Get featured projects with caching
  getFeaturedProjects: withCache(
    CACHE_KEYS.FEATURED_PROJECTS,
    CACHE_TTL.PROJECTS,
    async () => {
      try {
        // Clean up expired projects first
        await projectService.cleanupExpiredFeatured();

        // Get all featured projects
        const projectsRef = collection(db, 'projects');
        const q = query(
          projectsRef,
          where('status', '==', 'approved'),
          where('featured', '==', true)
        );
        const snapshot = await getDocs(q);
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

        // Sort by purchase date (newest purchases first)
        return projects.sort((a, b) => {
          const aDate = a.featuredPurchasedAt?.toDate?.() || new Date(a.featuredPurchasedAt || 0);
          const bDate = b.featuredPurchasedAt?.toDate?.() || new Date(b.featuredPurchasedAt || 0);
          return bDate.getTime() - aDate.getTime();
        });
      } catch (error) {
        console.error('Error getting featured projects:', error);
        return [];
      }
    }
  ),

  // Get new projects with caching
  getNewProjects: withCache(
    CACHE_KEYS.NEW_PROJECTS,
    CACHE_TTL.PROJECTS,
    async () => {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(24)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    }
  ),

  // Get project by ID with caching
  getProject: withDynamicCache(
    (id: string) => CACHE_KEYS.PROJECT_DETAIL(id),
    CACHE_TTL.PROJECT_DETAIL,
    async (id: string) => {
      const projectRef = doc(db, 'projects', id);
      const snapshot = await getDoc(projectRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Project;
      }
      return null;
    }
  ),

  // Get project by shortId (for SEO-friendly URLs) with caching
  getProjectByShortId: withDynamicCache(
    (shortId: string) => `project_shortId_${shortId}`,
    CACHE_TTL.PROJECT_DETAIL,
    async (shortId: string) => {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('shortId', '==', shortId),
        where('status', '==', 'approved'),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Project;
      } else {
        return null;
      }
    }
  ),

  // Generate SEO-friendly slug from project name and shortId
  generateSlug(name: string, shortId: string) {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    return `${cleanName}-${shortId}`;
  },

  // Generate short ID (6 characters)
  generateShortId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  },

  // Create new project
  async createProject(projectData: Omit<Project, 'id'>) {
    const projectsRef = collection(db, 'projects');
    const shortId = this.generateShortId();

    const docRef = await addDoc(projectsRef, {
      ...projectData,
      shortId,
      createdAt: serverTimestamp(),
      submittedAt: serverTimestamp(),
      status: 'pending',
      voteCount: 0,
      viewCount: 0,
      clickCount: 0,
      featured: false
    });
    return docRef.id;
  },

  // Update project
  async updateProject(id: string, updates: Partial<Project>) {
    const projectRef = doc(db, 'projects', id);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  // Submit new project
  async submitProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    const projectsRef = collection(db, 'projects');
    const shortId = this.generateShortId();

    const docRef = await addDoc(projectsRef, {
      ...projectData,
      shortId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Invalidate relevant caches since a new project was added
    invalidateCache('projects');
    invalidateCache('pending');
    console.log('Cache invalidated after project submission');

    return docRef.id;
  },

  // Get pending projects (admin only)
  async getPendingProjects() {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  },

  // Delete project and associated files
  async deleteProject(id: string) {
    try {
      // First get the project to access image URLs
      const projectRef = doc(db, 'projects', id);
      const projectDoc = await getDoc(projectRef);

      if (projectDoc.exists()) {
        const project = projectDoc.data();

        // Import deleteFile function dynamically to avoid circular imports
        const { deleteFile } = await import('./storage');

        // Delete thumbnail image if exists
        if (project.thumbnailUrl) {
          try {
            await deleteFile(project.thumbnailUrl);
            console.log('Deleted thumbnail:', project.thumbnailUrl);
          } catch (error) {
            console.warn('Failed to delete thumbnail:', error);
          }
        }

        // Delete gallery images if exist
        if (project.galleryUrls && Array.isArray(project.galleryUrls)) {
          for (const imageUrl of project.galleryUrls) {
            try {
              await deleteFile(imageUrl);
              console.log('Deleted gallery image:', imageUrl);
            } catch (error) {
              console.warn('Failed to delete gallery image:', error);
            }
          }
        }

        // Delete logo image if exists
        if (project.logoUrl) {
          try {
            await deleteFile(project.logoUrl);
            console.log('Deleted logo:', project.logoUrl);
          } catch (error) {
            console.warn('Failed to delete logo:', error);
          }
        }
      }

      // Finally delete the project document
      await deleteDoc(projectRef);
      console.log('Project deleted successfully:', id);

      // Invalidate relevant caches since project was deleted
      invalidateCache('projects');
      invalidateCache('pending');
      invalidateCache('new_projects');
      invalidateCache('featured');
      invalidateCache(`project_${id}`);
      console.log('Cache invalidated after project deletion');
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error(`Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Increment view count
  async incrementViewCount(id: string) {
    const projectRef = doc(db, 'projects', id);
    await updateDoc(projectRef, {
      viewCount: increment(1)
    });
  },

  // Increment click count
  async incrementClickCount(id: string) {
    const projectRef = doc(db, 'projects', id);
    await updateDoc(projectRef, {
      clickCount: increment(1)
    });
  },

  // Get project ranking in category and overall
  async getProjectRanking(projectId: string, category: string) {
    try {
      // Get all approved projects
      const allProjects = await this.getProjects(1000);

      // Sort by vote count (descending) for overall ranking
      const sortedByVotes = [...allProjects].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
      const overallRank = sortedByVotes.findIndex(p => p.id === projectId) + 1;

      // Filter by category and sort for category ranking
      const categoryProjects = allProjects.filter(p => p.category === category);
      const sortedCategoryByVotes = [...categoryProjects].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
      const categoryRank = sortedCategoryByVotes.findIndex(p => p.id === projectId) + 1;

      return {
        categoryRank: categoryRank || 0,
        totalInCategory: categoryProjects.length,
        overallRank: overallRank || 0,
        totalProjects: allProjects.length
      };
    } catch (error) {
      console.error('Error calculating project ranking:', error);
      return {
        categoryRank: 0,
        totalInCategory: 0,
        overallRank: 0,
        totalProjects: 0
      };
    }
  },

  // Search projects
  async searchProjects(searchTerm: string, category?: string) {
    const projectsRef = collection(db, 'projects');

    try {
      let q = query(
        projectsRef,
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );

      if (category && category !== 'all') {
        q = query(
          projectsRef,
          where('status', '==', 'approved'),
          where('category', '==', category),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

      // Client-side search filtering
      if (searchTerm) {
        return projects.filter(project =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      return projects;
    } catch (error) {
      console.warn('Search query failed, using simple query:', error);
      // Fallback to simple query without orderBy
      let q = query(
        projectsRef,
        where('status', '==', 'approved')
      );

      if (category && category !== 'all') {
        q = query(
          projectsRef,
          where('status', '==', 'approved'),
          where('category', '==', category)
        );
      }

      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

      // Sort in memory
      const sortedProjects = projects.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(0);
        const bDate = b.createdAt?.toDate?.() || new Date(0);
        return bDate.getTime() - aDate.getTime();
      });

      // Client-side search filtering
      if (searchTerm) {
        return sortedProjects.filter(project =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      return sortedProjects;
    }
  },

  // Get projects by category with caching
  getProjectsByCategory: withDynamicCache(
    (category: string) => `projects_category_${category.toLowerCase().replace(/\s+/g, '_')}`,
    CACHE_TTL.PROJECTS,
    async (category: string) => {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('status', '==', 'approved'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    }
  ),

  // Get pending projects (admin only)
  async getPendingProjects() {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  },

  // Approve project (admin only)
  async approveProject(projectId: string, reviewNotes?: string) {
    const projectRef = doc(db, 'projects', projectId);

    // First, get the project data before updating
    const projectSnapshot = await getDoc(projectRef);
    if (!projectSnapshot.exists()) {
      throw new Error('Project not found');
    }

    const project = { id: projectSnapshot.id, ...projectSnapshot.data() } as Project;

    // Update project status
    await updateDoc(projectRef, {
      status: 'approved',
      reviewNotes: reviewNotes || '',
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Invalidate relevant caches since project status changed
    invalidateCache('projects');
    invalidateCache('pending');
    invalidateCache('new_projects');
    invalidateCache('featured');
    invalidateCache(`project_${projectId}`);
    console.log('Cache invalidated after project approval');

    // Trigger social media auto-sharing in the background
    // Don't await this to avoid blocking the approval process
    console.log(`🚀 Triggering social media sharing for: ${project.name}`);
    this.handleSocialMediaSharing(project).catch(error => {
      console.error('❌ Social media sharing failed for project:', project.name, error);
    });
  },

  // Handle social media sharing after project approval
  async handleSocialMediaSharing(project: Project) {
    try {
      console.log(`🚀 Starting social media sharing for project: ${project.name}`);

      // Check if auto-sharing is enabled
      if (process.env.SOCIAL_MEDIA_AUTO_SHARE !== 'true') {
        console.log('Social media auto-sharing is disabled');
        return;
      }

      // Share the project on all configured platforms
      const socialPosts = await socialMediaManager.shareProject(project);

      // Update project with social media sharing info
      if (socialPosts.length > 0) {
        const projectRef = doc(db, 'projects', project.id);
        await updateDoc(projectRef, {
          socialMediaShared: true,
          socialMediaPosts: socialPosts.map(post => post.id),
          updatedAt: serverTimestamp(),
        });

        console.log(`✅ Successfully shared project "${project.name}" on ${socialPosts.length} platforms`);
      }
    } catch (error) {
      console.error('Error in social media sharing process:', error);

      // Log the error to a social media errors collection for admin review
      try {
        await addDoc(collection(db, 'socialMediaErrors'), {
          projectId: project.id,
          projectName: project.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: serverTimestamp(),
        });
      } catch (logError) {
        console.error('Failed to log social media error:', logError);
      }
    }
  },

  // Handle social media sharing for featured projects
  async handleFeaturedProjectSharing(project: Project) {
    try {
      console.log(`⭐ Starting featured project social media sharing for: ${project.name}`);

      // Check if auto-sharing is enabled and share on featured is enabled
      if (process.env.SOCIAL_MEDIA_AUTO_SHARE !== 'true') {
        console.log('Social media auto-sharing is disabled');
        return;
      }

      // Create a special featured project post with different messaging
      const featuredProject = {
        ...project,
        tagline: `⭐ FEATURED: ${project.tagline}`,
        description: `🌟 This amazing project is now featured on ShowYourProject.com!\n\n${project.description}`,
      };

      // Share the featured project
      const socialPosts = await socialMediaManager.shareProject(featuredProject);

      // Update project with additional social media sharing info
      if (socialPosts.length > 0) {
        const projectRef = doc(db, 'projects', project.id);
        const existingPosts = project.socialMediaPosts || [];

        await updateDoc(projectRef, {
          socialMediaPosts: [...existingPosts, ...socialPosts.map(post => post.id)],
          updatedAt: serverTimestamp(),
        });

        console.log(`✅ Successfully shared featured project "${project.name}" on ${socialPosts.length} platforms`);
      }
    } catch (error) {
      console.error('Error in featured project social media sharing:', error);

      // Log the error
      try {
        await addDoc(collection(db, 'socialMediaErrors'), {
          projectId: project.id,
          projectName: project.name,
          type: 'featured_sharing',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: serverTimestamp(),
        });
      } catch (logError) {
        console.error('Failed to log featured project social media error:', logError);
      }
    }
  },

  // Reject project (admin only)
  async rejectProject(projectId: string, rejectionReason: string) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      status: 'rejected',
      rejectionReason: rejectionReason,
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Invalidate relevant caches since project status changed
    invalidateCache('projects');
    invalidateCache('pending');
    invalidateCache(`project_${projectId}`);
    console.log('Cache invalidated after project rejection');
  },

  // Update project (admin only)
  async updateProject(projectId: string, updates: Partial<Project>) {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }
};

// Vote Services
export const voteService = {
  // Vote for project
  async voteForProject(projectId: string, userId: string) {
    const voteRef = doc(db, 'votes', `${userId}_${projectId}`);
    const voteDoc = await getDoc(voteRef);

    if (voteDoc.exists()) {
      // Remove vote
      await deleteDoc(voteRef);
      await updateDoc(doc(db, 'projects', projectId), {
        voteCount: increment(-1)
      });
      return false;
    } else {
      // Add vote using setDoc to prevent duplicates
      await setDoc(voteRef, {
        userId,
        projectId,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'projects', projectId), {
        voteCount: increment(1)
      });
      return true;
    }
  },

  // Check if user voted for project
  async hasUserVoted(projectId: string, userId: string) {
    const voteRef = doc(db, 'votes', `${userId}_${projectId}`);
    const voteDoc = await getDoc(voteRef);
    return voteDoc.exists();
  }
};

// File Upload Services
export const uploadService = {
  // Upload project image with optimization
  async uploadProjectImage(file: File, projectId: string, imageType: 'screenshot' | 'logo') {
    const { uploadFile } = await import('./storage');
    const fileName = `${imageType}_${Date.now()}_${file.name}`;
    const path = `projects/${projectId}/${fileName}`;

    return uploadFile(file, path, true); // Enable optimization
  },

  // Upload user avatar with optimization
  async uploadUserAvatar(file: File, userId: string) {
    const { uploadFile } = await import('./storage');
    const fileName = `avatar_${Date.now()}_${file.name}`;
    const path = `users/${userId}/${fileName}`;

    return uploadFile(file, path, true); // Enable optimization
  }
};

// Category Services
export const categoryService = {
  // Get all categories
  async getCategories() {
    const categoriesRef = collection(db, 'categories');
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// User Services
export const userService = {
  // Get user projects
  async getUserProjects(userId: string) {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('submitterId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  },

  // Get all users (admin only)
  async getAllUsers() {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }
};

// Points System Services
export const pointsService = {
  _indexWarningLogged: false, // Track if we've already shown the index warning

  // Award points to user for an action
  async awardPoints(userId: string, action: 'like' | 'click', projectId: string, points: number) {
    try {
      // Create points transaction
      const transactionData: Omit<PointsTransaction, 'id'> = {
        userId,
        type: 'earned',
        action,
        points,
        projectId,
        description: action === 'like' ? 'Liked a project' : 'Clicked project website',
        createdAt: serverTimestamp() as any
      };

      // Add transaction record
      await addDoc(collection(db, 'pointsTransactions'), transactionData);

      // Update user's points
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        points: increment(points),
        totalPointsEarned: increment(points)
      });

      return true;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  },

  // Get user's points transactions
  async getUserTransactions(userId: string) {
    try {
      const transactionsRef = collection(db, 'pointsTransactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PointsTransaction));
    } catch (error: any) {
      // Only log warning once per session to avoid spam
      if (!this._indexWarningLogged) {
        console.warn('Points transactions index not available, using fallback. Create index at:', error.message.match(/https:\/\/[^\s]+/)?.[0]);
        this._indexWarningLogged = true;
      }

      // Fallback: Get all transactions and filter client-side
      const transactionsRef = collection(db, 'pointsTransactions');
      const q = query(transactionsRef, limit(200)); // Get more to filter
      const snapshot = await getDocs(q);

      const allTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PointsTransaction));
      const userTransactions = allTransactions
        .filter(t => t.userId === userId)
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        })
        .slice(0, 50);

      return userTransactions;
    }
  },

  // Purchase featured spot
  async purchaseFeaturedSpot(userId: string, projectId: string) {
    try {
      // Check if user has enough points
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() as User;

      if (!userData || userData.points < POINTS_CONFIG.FEATURED_COST) {
        throw new Error('Insufficient points');
      }

      // Check if project is already featured
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);
      const projectData = projectDoc.data() as Project;

      if (projectData.featured) {
        throw new Error('Project is already featured');
      }

      // Check available featured slots
      const activeFeaturedSlots = await this.getActiveFeaturedSlots();
      if (activeFeaturedSlots.length >= POINTS_CONFIG.MAX_FEATURED_SLOTS) {
        throw new Error('No featured slots available');
      }

      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + POINTS_CONFIG.FEATURED_DURATION_DAYS);

      // Create featured slot
      const featuredSlotData: Omit<FeaturedSlot, 'id'> = {
        projectId,
        userId,
        purchasedAt: serverTimestamp() as any,
        expiresAt: expiresAt as any,
        pointsSpent: POINTS_CONFIG.FEATURED_COST,
        status: 'active'
      };

      await addDoc(collection(db, 'featuredSlots'), featuredSlotData);

      // Update project as featured
      await updateDoc(projectRef, {
        featured: true,
        featuredUntil: expiresAt,
        featuredBy: 'user',
        featuredPurchasedAt: serverTimestamp()
      });

      // Deduct points from user
      await updateDoc(userRef, {
        points: increment(-POINTS_CONFIG.FEATURED_COST),
        totalPointsSpent: increment(POINTS_CONFIG.FEATURED_COST),
        featuredPurchases: increment(1)
      });

      // Create points transaction
      const transactionData: Omit<PointsTransaction, 'id'> = {
        userId,
        type: 'spent',
        action: 'featured_purchase',
        points: POINTS_CONFIG.FEATURED_COST,
        projectId,
        description: 'Purchased featured spot',
        createdAt: serverTimestamp() as any
      };

      await addDoc(collection(db, 'pointsTransactions'), transactionData);

      return true;
    } catch (error) {
      console.error('Error purchasing featured spot:', error);
      throw error;
    }
  },

  // Get active featured slots
  async getActiveFeaturedSlots() {
    try {
      const slotsRef = collection(db, 'featuredSlots');
      const q = query(
        slotsRef,
        where('status', '==', 'active'),
        where('expiresAt', '>', new Date()),
        orderBy('expiresAt', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeaturedSlot));
    } catch (indexError) {
      console.warn('Featured slots index not available, using fallback:', indexError);

      // Fallback: Get all featured slots and filter client-side
      const slotsRef = collection(db, 'featuredSlots');
      const snapshot = await getDocs(slotsRef);
      const allSlots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeaturedSlot));

      // Filter active and non-expired slots client-side
      const now = new Date();
      return allSlots
        .filter(slot =>
          slot.status === 'active' &&
          slot.expiresAt &&
          slot.expiresAt.toDate() > now
        )
        .sort((a, b) => a.expiresAt.toDate().getTime() - b.expiresAt.toDate().getTime());
    }
  },

  // Clean up expired featured slots (should be run periodically)
  async cleanupExpiredSlots() {
    try {
      let snapshot;
      try {
        const slotsRef = collection(db, 'featuredSlots');
        const q = query(
          slotsRef,
          where('status', '==', 'active'),
          where('expiresAt', '<=', new Date())
        );
        snapshot = await getDocs(q);
      } catch (indexError) {
        console.warn('Featured slots cleanup index not available, using fallback:', indexError);

        // Fallback: Get all slots and filter client-side
        const slotsRef = collection(db, 'featuredSlots');
        const allSnapshot = await getDocs(slotsRef);
        const now = new Date();

        const expiredSlots = allSnapshot.docs.filter(doc => {
          const slot = doc.data() as FeaturedSlot;
          return slot.status === 'active' &&
                 slot.expiresAt &&
                 slot.expiresAt.toDate() <= now;
        });

        snapshot = { docs: expiredSlots } as any;
      }

      for (const slotDoc of snapshot.docs) {
        const slot = slotDoc.data() as FeaturedSlot;

        // Update slot status
        await updateDoc(doc(db, 'featuredSlots', slotDoc.id), {
          status: 'expired'
        });

        // Update project featured status
        await updateDoc(doc(db, 'projects', slot.projectId), {
          featured: false,
          featuredUntil: null,
          featuredBy: null,
          featuredPurchasedAt: null
        });
      }

      return snapshot.docs.length;
    } catch (error) {
      console.error('Error cleaning up expired slots:', error);
      throw error;
    }
  }
};

// Admin Services for Featured Management
export const adminService = {
  // Manually set project as featured (admin only)
  async setProjectFeatured(projectId: string, featured: boolean, adminUserId: string) {
    try {
      const projectRef = doc(db, 'projects', projectId);

      if (featured) {
        // Get project data for potential social sharing
        const projectSnapshot = await getDoc(projectRef);
        if (!projectSnapshot.exists()) {
          throw new Error('Project not found');
        }

        const project = { id: projectSnapshot.id, ...projectSnapshot.data() } as Project;

        // Set as featured by admin (no expiration)
        await updateDoc(projectRef, {
          featured: true,
          featuredBy: 'admin',
          featuredPurchasedAt: serverTimestamp()
        });

        // Trigger social media sharing for featured projects if enabled
        if (process.env.SOCIAL_MEDIA_AUTO_SHARE === 'true') {
          projectService.handleFeaturedProjectSharing(project).catch(error => {
            console.error('Featured project social media sharing failed:', error);
          });
        }
      } else {
        // Remove featured status
        await updateDoc(projectRef, {
          featured: false,
          featuredUntil: null,
          featuredBy: null,
          featuredPurchasedAt: null
        });

        // If there was an active slot, mark it as expired
        const slotsRef = collection(db, 'featuredSlots');
        const q = query(
          slotsRef,
          where('projectId', '==', projectId),
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);

        for (const slotDoc of snapshot.docs) {
          await updateDoc(doc(db, 'featuredSlots', slotDoc.id), {
            status: 'expired'
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error setting featured status:', error);
      throw error;
    }
  },

  // Get all featured slots for admin management
  async getAllFeaturedSlots() {
    const slotsRef = collection(db, 'featuredSlots');
    const q = query(slotsRef, orderBy('purchasedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeaturedSlot));
  },

  // Award bonus points to user (admin only)
  async awardBonusPoints(userId: string, points: number, description: string, adminUserId: string) {
    try {
      // Create points transaction
      const transactionData: Omit<PointsTransaction, 'id'> = {
        userId,
        type: 'earned',
        action: 'admin_bonus',
        points,
        description: `Admin bonus: ${description}`,
        createdAt: serverTimestamp() as any
      };

      await addDoc(collection(db, 'pointsTransactions'), transactionData);

      // Update user's points
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        points: increment(points),
        totalPointsEarned: increment(points)
      });

      return true;
    } catch (error) {
      console.error('Error awarding bonus points:', error);
      throw error;
    }
  }
};

// Messaging Services
export const messagingService = {
  // Start a new conversation or get existing one
  async startConversation(projectId: string, projectOwnerId: string, contacterId: string, contacterName: string, contacterEmail: string) {
    try {
      // Get project details
      const project = await projectService.getProject(projectId);
      if (!project) throw new Error('Project not found');

      // Check if conversation already exists
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('projectId', '==', projectId),
        where('contacterId', '==', contacterId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        // Return existing conversation
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Conversation;
      }

      // Create new conversation
      const conversationData: Omit<Conversation, 'id'> = {
        projectId,
        projectName: project.name,
        projectOwnerId,
        projectOwnerName: project.submitterName,
        projectOwnerEmail: project.submitterEmail,
        contacterId,
        contacterName,
        contacterEmail,
        unreadCount: {
          [projectOwnerId]: 0,
          [contacterId]: 0
        },
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any
      };

      const docRef = await addDoc(conversationsRef, conversationData);
      return { id: docRef.id, ...conversationData } as Conversation;

    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  },

  // Send a message in a conversation
  async sendMessage(conversationId: string, senderId: string, senderName: string, senderEmail: string, content: string) {
    try {
      // Add message
      const messageData: Omit<Message, 'id'> = {
        conversationId,
        senderId,
        senderName,
        senderEmail,
        content,
        createdAt: serverTimestamp() as any,
        read: false
      };

      const messagesRef = collection(db, 'messages');
      const messageDoc = await addDoc(messagesRef, messageData);

      // Update conversation
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDoc(conversationRef);
      const conversation = conversationDoc.data() as Conversation;

      // Determine who should get the unread count increment
      const receiverId = senderId === conversation.projectOwnerId ? conversation.contacterId : conversation.projectOwnerId;

      await updateDoc(conversationRef, {
        lastMessage: content.substring(0, 100),
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [`unreadCount.${receiverId}`]: increment(1)
      });

      return { id: messageDoc.id, ...messageData } as Message;

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get user's conversations
  async getUserConversations(userId: string) {
    try {
      // Try to get conversations where user is project owner
      const conversationsRef = collection(db, 'conversations');
      let ownerConversations: Conversation[] = [];
      let contacterConversations: Conversation[] = [];

      try {
        const q1 = query(
          conversationsRef,
          where('projectOwnerId', '==', userId),
          orderBy('updatedAt', 'desc')
        );
        const snapshot1 = await getDocs(q1);
        ownerConversations = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      } catch (indexError) {
        console.warn('Index not available for projectOwnerId query, using fallback');
      }

      try {
        const q2 = query(
          conversationsRef,
          where('contacterId', '==', userId),
          orderBy('updatedAt', 'desc')
        );
        const snapshot2 = await getDocs(q2);
        contacterConversations = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      } catch (indexError) {
        console.warn('Index not available for contacterId query, using fallback');
      }

      // If both queries failed, use complete fallback
      if (ownerConversations.length === 0 && contacterConversations.length === 0) {
        console.warn('Using complete fallback for conversations');
        const snapshot = await getDocs(conversationsRef);
        const allConversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));

        return allConversations
          .filter(conv => conv.projectOwnerId === userId || conv.contacterId === userId)
          .sort((a, b) => {
            const aTime = a.updatedAt?.toDate?.() || new Date(0);
            const bTime = b.updatedAt?.toDate?.() || new Date(0);
            return bTime.getTime() - aTime.getTime();
          });
      }

      // Combine and deduplicate
      const conversations = new Map();

      ownerConversations.forEach(conv => {
        conversations.set(conv.id, conv);
      });

      contacterConversations.forEach(conv => {
        conversations.set(conv.id, conv);
      });

      return Array.from(conversations.values()).sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  },

  // Get messages in a conversation
  async getConversationMessages(conversationId: string) {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));

    } catch (indexError) {
      console.warn('Index not available for messages query, using fallback');

      // Fallback: get all messages and filter client-side
      const messagesRef = collection(db, 'messages');
      const snapshot = await getDocs(messagesRef);
      const allMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));

      return allMessages
        .filter(message => message.conversationId === conversationId)
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return aTime.getTime() - bTime.getTime();
        });
    }
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string) {
    try {
      // Update conversation unread count
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0
      });

      // Mark messages as read
      try {
        const messagesRef = collection(db, 'messages');
        const q = query(
          messagesRef,
          where('conversationId', '==', conversationId),
          where('senderId', '!=', userId),
          where('read', '==', false)
        );
        const snapshot = await getDocs(q);

        const batch = snapshot.docs.map(messageDoc =>
          updateDoc(doc(db, 'messages', messageDoc.id), { read: true })
        );

        await Promise.all(batch);
      } catch (indexError) {
        console.warn('Index not available for mark as read query, using fallback');

        // Fallback: get all messages and filter client-side
        const messagesRef = collection(db, 'messages');
        const snapshot = await getDocs(messagesRef);
        const messagesToUpdate = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Message))
          .filter(message =>
            message.conversationId === conversationId &&
            message.senderId !== userId &&
            !message.read
          );

        const batch = messagesToUpdate.map(message =>
          updateDoc(doc(db, 'messages', message.id), { read: true })
        );

        await Promise.all(batch);
      }

    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Admin functions
  // Get all conversations (admin only)
  async getAllConversations() {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(conversationsRef, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
    } catch (indexError) {
      console.warn('Index not available for admin conversations query, using fallback');

      // Fallback: get all conversations and sort client-side
      const conversationsRef = collection(db, 'conversations');
      const snapshot = await getDocs(conversationsRef);
      const allConversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));

      return allConversations.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
    }
  },

  // Get all messages (admin only)
  async getAllMessages() {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1000));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    } catch (indexError) {
      console.warn('Index not available for admin messages query, using fallback');

      // Fallback: get all messages and sort client-side
      const messagesRef = collection(db, 'messages');
      const snapshot = await getDocs(messagesRef);
      const allMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));

      return allMessages
        .sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        })
        .slice(0, 1000); // Limit to 1000 messages
    }
  },

  // Get messaging statistics (admin only)
  async getMessagingStats() {
    try {
      const [conversations, messages] = await Promise.all([
        this.getAllConversations(),
        this.getAllMessages()
      ]);

      const totalConversations = conversations.length;
      const activeConversations = conversations.filter(conv =>
        conv.lastMessageAt &&
        conv.lastMessageAt.toDate() > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      ).length;

      const totalMessages = messages.length;
      const todayMessages = messages.filter(msg =>
        msg.createdAt.toDate() > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      ).length;

      const uniqueUsers = new Set();
      conversations.forEach(conv => {
        uniqueUsers.add(conv.projectOwnerId);
        uniqueUsers.add(conv.contacterId);
      });

      return {
        totalConversations,
        activeConversations,
        totalMessages,
        todayMessages,
        uniqueMessagingUsers: uniqueUsers.size
      };
    } catch (error) {
      console.error('Error getting messaging stats:', error);
      return {
        totalConversations: 0,
        activeConversations: 0,
        totalMessages: 0,
        todayMessages: 0,
        uniqueMessagingUsers: 0
      };
    }
  }
};
