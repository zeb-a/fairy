import supabaseService from '../services/supabaseService';

/**
 * Helper function to resolve public URL for avatar
 * @param {string} avatarUrl - The avatar URL (could be emoji or image path)
 * @param {string} avatarType - The type of avatar ('emoji' or 'image')
 * @returns {string} - The resolved avatar URL for display
 */
export const resolveAvatarUrl = (avatarUrl, avatarType) => {
  if (!avatarUrl) {
    return '👤'; // Default avatar if none provided
  }
  
  if (avatarType === 'emoji' || isEmojiAvatar(avatarUrl)) {
    return avatarUrl; // Return the emoji directly
  }
  
  // Check if it's already a public URL (contains http/https)
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  
  // It's a file path, need to get public URL
  try {
    return supabaseService.storage.getPublicUrl(avatarUrl);
  } catch (error) {
    console.error('Error resolving avatar URL:', error);
    return '👤'; // Return default avatar on error
  }
};

/**
 * Helper function to determine if an avatar is an emoji
 * @param {string} avatar - The avatar string
 * @returns {boolean} - True if the avatar is an emoji
 */
export const isEmojiAvatar = (avatar) => {
  if (!avatar) {
    return false;
  }
  
  // Check if the avatar is a URL (contains http/https)
  if (avatar.startsWith('http')) {
    return false;
  }
  
  // Simple check: if it's a single character that's likely an emoji
  // This is a basic check - you might want to use a more sophisticated emoji detection library
  return avatar.length <= 2 && /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(avatar);
};