import { ResourceTypeEnum } from '../types/resource.types';

/**
 * Determines if a user role has permission to book a specific resource type.
 * 
 * Rules:
 * - ADMIN / TECHNICIAN: Usually don't book (they manage).
 * - LECTURER: Can book all resource types.
 * - STUDENT: Can book MEETING_ROOM, EQUIPMENT, and LIBRARY. 
 *   Cannot book LECTURE_HALL or LAB.
 * 
 * @param {string} role - User role (e.g., 'STUDENT', 'LECTURER')
 * @param {string} resourceType - Resource type (e.g., 'LECTURE_HALL', 'LIBRARY')
 * @returns {boolean} - True if booking is allowed
 */
export function canUserBookResourceType(role, resourceType) {
  if (!role || !resourceType) return false;
  
  const normalizedRole = role.toUpperCase();
  const normalizedType = resourceType.toUpperCase();

  // Admin and Technician manage resources, they don't 'book' via the standard flow
  if (normalizedRole === 'ADMIN' || normalizedRole === 'TECHNICIAN') {
    return false;
  }

  // Lecturers have full access
  if (normalizedRole === 'LECTURER') {
    return true;
  }

  // Students have restricted access
  if (normalizedRole === 'STUDENT' || normalizedRole === 'USER') {
    return (
      normalizedType === ResourceTypeEnum.MEETING_ROOM ||
      normalizedType === ResourceTypeEnum.EQUIPMENT ||
      normalizedType === ResourceTypeEnum.LIBRARY ||
      normalizedType === ResourceTypeEnum.STUDY_SPACE
    );
  }

  return false;
}
