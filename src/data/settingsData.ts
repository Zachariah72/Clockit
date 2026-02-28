// Settings data for each section
export interface SettingItem {
  id: string;
  title: string;
  description?: string;
  type: 'toggle' | 'link' | 'button' | 'info';
  value?: boolean | string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SettingsSectionData {
  id: string;
  title: string;
  description: string;
  items: SettingItem[];
}

export const settingsData: SettingsSectionData[] = [
  {
    id: 'account',
    title: 'Account',
    description: 'Manage your account settings and preferences',
    items: [
      { id: 'edit-profile', title: 'Edit Profile', description: 'Change your display name, username, bio, and avatar', type: 'link' },
      { id: 'change-email', title: 'Change Email', description: 'Update your email address', type: 'link' },
      { id: 'change-password', title: 'Change Password', description: 'Update your password', type: 'link' },
      { id: 'two-factor', title: 'Two-Factor Authentication', description: 'Add an extra layer of security', type: 'toggle', value: false },
      { id: 'linked-accounts', title: 'Linked Accounts', description: 'Connect or disconnect social accounts', type: 'link' },
      { id: 'delete-account', title: 'Delete Account', description: 'Permanently delete your account and data', type: 'button' },
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'Control your privacy and security settings',
    items: [
      { id: 'profile-visibility', title: 'Profile Visibility', description: 'Who can see your profile', type: 'link', value: 'public' },
      { id: 'activity-status', title: 'Activity Status', description: 'Show when you\'re active', type: 'toggle', value: true },
      { id: 'read-receipts', title: 'Read Receipts', description: 'Let others know when you\'ve read their messages', type: 'toggle', value: true },
      { id: 'last-seen', title: 'Last Seen', description: 'Show when you were last active', type: 'toggle', value: true },
      { id: 'blocked-users', title: 'Blocked Users', description: 'Manage your blocked list', type: 'link' },
      { id: 'hidden-content', title: 'Hidden Content', description: 'Hide content from specific users', type: 'link' },
    ]
  },
  {
    id: 'messaging',
    title: 'Messaging & Calls',
    description: 'Configure messaging and calling preferences',
    items: [
      { id: 'message-requests', title: 'Message Requests', description: 'Control who can send you messages', type: 'link', value: 'everyone' },
      { id: 'group-invites', title: 'Group Invites', description: 'Who can add you to groups', type: 'link', value: 'everyone' },
      { id: 'voice-calls', title: 'Voice Calls', description: 'Allow voice calls', type: 'toggle', value: true },
      { id: 'video-calls', title: 'Video Calls', description: 'Allow video calls', type: 'toggle', value: true },
      { id: 'call-quality', title: 'Call Quality', description: 'Set preferred call quality', type: 'link', value: 'auto' },
      { id: 'noise-suppression', title: 'Noise Suppression', description: 'Reduce background noise during calls', type: 'toggle', value: true },
    ]
  },
  {
    id: 'music',
    title: 'Music & Audio',
    description: 'Customize your music listening experience',
    items: [
      { id: 'audio-quality', title: 'Audio Quality', description: 'Streaming quality for music', type: 'link', value: 'high' },
      { id: 'autoplay', title: 'Autoplay', description: 'Automatically play next song', type: 'toggle', value: true },
      { id: 'crossfade', title: 'Crossfade', description: 'Smooth transition between songs', type: 'toggle', value: false },
      { id: 'equalizer', title: 'Equalizer', description: 'Customize audio frequencies', type: 'link' },
      { id: 'downloading', title: 'Download Quality', description: 'Quality for downloaded music', type: 'link', value: 'high' },
      { id: 'storage', title: 'Storage Management', description: 'Manage downloaded music', type: 'link' },
    ]
  },
  {
    id: 'content',
    title: 'Content & Feed',
    description: 'Personalize your content and feed preferences',
    items: [
      { id: 'feed-order', title: 'Feed Order', description: 'How posts appear in your feed', type: 'link', value: 'recent' },
      { id: 'auto-play', title: 'Autoplay Videos', description: 'Automatically play videos in feed', type: 'toggle', value: true },
      { id: 'muted-words', title: 'Muted Words', description: 'Hide content with specific words', type: 'link' },
      { id: 'content-preferences', title: 'Content Preferences', description: 'Customize your recommendations', type: 'link' },
      { id: 'language', title: 'Content Language', description: 'Preferred language for content', type: 'link', value: 'english' },
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Insights',
    description: 'Manage your analytics and performance data',
    items: [
      { id: 'profile-views', title: 'Profile Views', description: 'See who viewed your profile', type: 'toggle', value: true },
      { id: 'post-insights', title: 'Post Insights', description: 'View analytics for your posts', type: 'toggle', value: true },
      { id: 'reach-statistics', title: 'Reach Statistics', description: 'Track your content reach', type: 'toggle', value: true },
      { id: 'audience-insights', title: 'Audience Insights', description: 'Learn about your followers', type: 'link' },
      { id: 'export-data', title: 'Export Data', description: 'Download your analytics data', type: 'button' },
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Control your notification preferences',
    items: [
      { id: 'push-notifications', title: 'Push Notifications', description: 'Receive push notifications', type: 'toggle', value: true },
      { id: 'email-notifications', title: 'Email Notifications', description: 'Receive email notifications', type: 'toggle', value: true },
      { id: 'sms-notifications', title: 'SMS Notifications', description: 'Receive SMS notifications', type: 'toggle', value: false },
      { id: 'likes-notifications', title: 'Likes', description: 'Notifications when someone likes your posts', type: 'toggle', value: true },
      { id: 'comments-notifications', title: 'Comments', description: 'Notifications on your posts', type: 'toggle', value: true },
      { id: 'followers-notifications', title: 'New Followers', description: 'Notifications when someone follows you', type: 'toggle', value: true },
      { id: 'mentions-notifications', title: 'Mentions', description: 'Notifications when someone mentions you', type: 'toggle', value: true },
      { id: 'sound', title: 'Notification Sound', description: 'Sound for notifications', type: 'toggle', value: true },
      { id: 'vibration', title: 'Vibration', description: 'Vibrate for notifications', type: 'toggle', value: true },
    ]
  },
  {
    id: 'appearance',
    title: 'Appearance & Themes',
    description: 'Customize your app appearance and themes',
    items: [
      { id: 'theme', title: 'Theme', description: 'Choose light, dark, or system theme', type: 'link', value: 'dark' },
      { id: 'wallpaper', title: 'Wallpaper', description: 'Customize your home screen wallpaper', type: 'link' },
      { id: 'accent-color', title: 'Accent Color', description: 'Choose your accent color', type: 'link', value: 'cyan' },
      { id: 'font-size', title: 'Font Size', description: 'Adjust text size', type: 'link', value: 'medium' },
      { id: 'animations', title: 'Animations', description: 'Enable UI animations', type: 'toggle', value: true },
      { id: 'compact-mode', title: 'Compact Mode', description: 'Show more content with less spacing', type: 'toggle', value: false },
    ]
  },
  {
    id: 'wellbeing',
    title: 'Screen Time & Wellbeing',
    description: 'Manage your screen time and digital wellbeing',
    items: [
      { id: 'daily-reminder', title: 'Daily Reminder', description: 'Remind me to take breaks', type: 'toggle', value: false },
      { id: 'screen-time', title: 'Screen Time Dashboard', description: 'View your usage statistics', type: 'link' },
      { id: 'sleep-mode', title: 'Sleep Mode', description: 'Schedule quiet hours', type: 'link' },
      { id: 'content-break', title: 'Content Breaks', description: 'Take breaks from certain content', type: 'link' },
      { id: 'usage-alerts', title: 'Usage Alerts', description: 'Alert when exceeding daily limit', type: 'toggle', value: false },
      { id: 'mute-limited', title: 'Mute Keyword Limits', description: 'Keywords to limit in feed', type: 'link' },
    ]
  },
  {
    id: 'data',
    title: 'App & Data',
    description: 'Manage app data and storage settings',
    items: [
      { id: 'storage-used', title: 'Storage Used', description: 'View storage usage', type: 'info', value: '256 MB' },
      { id: 'clear-cache', title: 'Clear Cache', description: 'Free up storage space', type: 'button' },
      { id: 'auto-download', title: 'Auto-Download', description: 'Download content over WiFi only', type: 'toggle', value: true },
      { id: 'wifi-only', title: 'WiFi Only', description: 'Only stream/download on WiFi', type: 'toggle', value: true },
      { id: 'data-saver', title: 'Data Saver', description: 'Use less data', type: 'toggle', value: false },
      { id: 'offline-data', title: 'Offline Data', description: 'Manage downloaded content', type: 'link' },
      { id: 'backup', title: 'Backup & Restore', description: 'Backup your data', type: 'button' },
    ]
  },
  {
    id: 'legal',
    title: 'Legal & Support',
    description: 'Legal information and support resources',
    items: [
      { id: 'terms', title: 'Terms of Service', description: 'Read our terms', type: 'link' },
      { id: 'privacy-policy', title: 'Privacy Policy', description: 'Read our privacy policy', type: 'link' },
      { id: 'cookies', title: 'Cookie Policy', description: 'Learn about cookies', type: 'link' },
      { id: 'licenses', title: 'Open Source Licenses', description: 'View third-party licenses', type: 'link' },
      { id: 'help', title: 'Help Center', description: 'Get help and support', type: 'link' },
      { id: 'report', title: 'Report a Problem', description: 'Report bugs or issues', type: 'button' },
      { id: 'contact', title: 'Contact Us', description: 'Get in touch with our team', type: 'link' },
    ]
  }
];

export const getSettingsSection = (sectionId: string): SettingsSectionData | undefined => {
  return settingsData.find(section => section.id === sectionId);
};
