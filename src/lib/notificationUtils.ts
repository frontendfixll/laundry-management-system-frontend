/**
 * Utility functions for cleaning notification data
 */

/**
 * Remove emojis and special characters from notification titles
 * This handles emojis that might be in the database or added by backend
 */
export const cleanNotificationTitle = (title: string): string => {
    if (!title) return '';

    // Remove common emojis and special characters
    // Using multiple simple replacements instead of unicode ranges for ES5 compatibility
    return title
        .replace(/[📜🎉🔔📋✨🔥💡⚡⭐🎯✅❌🚀💰🎁🏆📊📈📉💼🛒🔒🔓]/g, '')
        .replace(/[\u2600-\u26FF]/g, '')   // Misc symbols
        .replace(/[\u2700-\u27BF]/g, '')   // Dingbats
        .replace(/!/g, '')                  // Remove exclamation marks often used with emojis
        .replace(/\s+/g, ' ')              // Normalize whitespace
        .trim();
};

/**
 * Clean notification message
 */
export const cleanNotificationMessage = (message: string): string => {
  if (!message) return '';
  
  return message
    .replace(/[📜🎉🔔📋✨🔥💡⚡⭐🎯✅❌🚀💰🎁🏆📊📈📉💼🛒🔒🔓]/g, '')
    .replace(/[\u2600-\u26FF]/g, '')
    .replace(/[\u2700-\u27BF]/g, '')
    .trim();
};

/**
 * Clean entire notification object
 */
export const cleanNotification = (notification: any) => {
    return {
        ...notification,
        title: cleanNotificationTitle(notification.title),
        message: cleanNotificationMessage(notification.message)
    };
};
