import { z } from 'zod';

// Function to normalize URL by adding https:// if missing
const normalizeUrl = (url: string): string => {
  if (!url) return url;

  // Remove any leading/trailing whitespace
  url = url.trim();

  // If URL already has protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If URL starts with www., add https://
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }

  // If URL looks like a domain (contains dot and no spaces), add https://
  if (url.includes('.') && !url.includes(' ') && url.length > 3) {
    return `https://${url}`;
  }

  return url;
};

// Project submission validation schema
export const projectSubmissionSchema = z.object({
  name: z.string()
    .min(3, 'Project name must be at least 3 characters')
    .max(27, 'Project name must be less than 27 characters'),

  tagline: z.string()
    .min(10, 'Tagline must be at least 10 characters')
    .max(160, 'Tagline must be less than 160 characters'),

  description: z.string()
    .min(100, 'Description must be at least 100 characters')
    .max(1500, 'Description must be less than 1500 characters'),

  websiteUrl: z.string()
    .transform(normalizeUrl)
    .pipe(z.string().url('Please enter a valid website URL'))
    .refine((url) => !url.includes('localhost'), 'Local URLs are not allowed'),

  category: z.string().min(1, 'Please select a category'),

  tags: z.array(z.string()).min(1, 'At least one tag is required').max(8, 'Maximum 8 tags allowed'),

  teamSize: z.enum(['1', '2', '3-5', '5-10', '10+'], {
    required_error: 'Please select team size',
    invalid_type_error: 'Please select a valid team size'
  }),

  foundedYear: z.number()
    .min(2000, 'Founded year must be between 2000 and 2030')
    .max(2030, 'Founded year must be between 2000 and 2030'),

  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    producthunt: z.string().url().optional().or(z.literal(''))
  }).optional()
});

// Basic info step validation
export const basicInfoSchema = z.object({
  name: z.string()
    .min(3, 'Project name must be at least 3 characters')
    .max(27, 'Project name must be less than 27 characters'),
  
  tagline: z.string()
    .min(10, 'Tagline must be at least 10 characters')
    .max(160, 'Tagline must be less than 160 characters'),
  
  websiteUrl: z.string()
    .transform(normalizeUrl)
    .pipe(z.string().url('Please enter a valid website URL'))
    .refine((url) => !url.includes('localhost'), 'Local URLs are not allowed'),
  
  description: z.string()
    .min(100, 'Description must be at least 100 characters')
    .max(1500, 'Description must be less than 1500 characters'),
});

// Details step validation
export const detailsSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(8, 'Maximum 8 tags allowed'),
  teamSize: z.enum(['1', '2', '3-5', '5-10', '10+'], {
    required_error: 'Please select team size',
    invalid_type_error: 'Please select a valid team size'
  }),
  foundedYear: z.number()
    .min(2000, 'Founded year must be between 2000 and 2030')
    .max(2030, 'Founded year must be between 2000 and 2030'),
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    producthunt: z.string().url().optional().or(z.literal(''))
  }).optional()
});

// User profile validation
export const userProfileSchema = z.object({
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters'),
  
  website: z.string().url().optional().or(z.literal('')),
  
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal(''))
  }).optional()
});

// Email validation
export const emailSchema = z.string().email('Please enter a valid email address');

// Password validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Admin schemas
export const adminNotesSchema = z.object({
  adminNotes: z.string().max(1000, 'Admin notes must be less than 1000 characters').optional(),
  rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters').optional()
});

export type ProjectSubmissionData = z.infer<typeof projectSubmissionSchema>;
export type ProjectSubmission = z.infer<typeof projectSubmissionSchema>;
export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type DetailsData = z.infer<typeof detailsSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type AdminNotesData = z.infer<typeof adminNotesSchema>;
