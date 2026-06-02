export type DashboardSectionId =
  | 'overview'
  | 'search'
  | 'sessions'
  | 'skills'
  | 'messages'
  | 'notifications'
  | 'feed'
  | 'badges'
  | 'settings'
  | 'friends'

export const currentUser = {
  firstName: 'Sarah',
  lastName: 'Martin',
  field: 'Computer science student',
  level: 12,
  currentExperience: 3200,
  nextLevelExperience: 4000,
  avatarUrl:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
}

export const navigationSections: Array<{
  id: DashboardSectionId
  label: string
  iconName: string
  badgeCount?: number
}> = [
  { id: 'overview', label: 'Tableau de bord', iconName: 'home-outline' },
  { id: 'search', label: 'Recherche', iconName: 'search-outline' },
  { id: 'sessions', label: 'Mes sessions', iconName: 'calendar-outline' },
  { id: 'skills', label: 'Mes compétences', iconName: 'library-outline' },
  { id: 'messages', label: 'Messages', iconName: 'chatbox-ellipses-outline', badgeCount: 3 },
  { id: 'notifications', label: 'Notifications', iconName: 'notifications-outline', badgeCount: 5 },
  { id: 'feed', label: 'Feed social', iconName: 'share-social-outline' },
  { id: 'badges', label: 'Badges', iconName: 'ribbon-outline' },
  { id: 'friends', label: 'Mon profil', iconName: 'person-outline' },
  { id: 'settings', label: 'Paramètres', iconName: 'settings-outline' },
]

export const upcomingSessions = [
  {
    title: 'HTML/CSS Masterclass',
    hostName: 'Lucas Moreau',
    date: 'June 5, 2026',
    time: '18:00 - 20:00',
    participantsCount: 8,
    iconText: '</>',
    accentClassName: 'purple',
  },
  {
    title: 'Advanced JavaScript',
    hostName: 'Emma Dubois',
    date: 'June 7, 2026',
    time: '17:00 - 19:00',
    participantsCount: 6,
    iconText: 'JS',
    accentClassName: 'yellow',
  },
  {
    title: 'Figma for Beginners',
    hostName: 'Thomas Bernard',
    date: 'June 10, 2026',
    time: '14:00 - 16:00',
    participantsCount: 5,
    iconText: 'F',
    accentClassName: 'green',
  },
]

export const popularSkills = [
  { name: 'React', studentsCount: 128, iconName: 'logo-react' },
  { name: 'Python', studentsCount: 112, iconName: 'logo-python' },
  { name: 'Figma', studentsCount: 98, iconName: 'color-palette-outline' },
  { name: 'English', studentsCount: 87, iconName: 'language-outline' },
  { name: 'Photoshop', studentsCount: 76, iconName: 'image-outline' },
]

export const statistics = [
  { label: 'Upcoming sessions', value: '12', iconName: 'calendar-outline' },
  { label: 'Available skills', value: '350', iconName: 'library-outline' },
  { label: 'Students followed', value: '24', iconName: 'people-outline' },
  { label: 'Completed sessions', value: '120', iconName: 'bar-chart-outline' },
]

export const recommendations = [
  { title: 'Node.js Workshop', hostName: 'Hugo Bernard', schedule: 'June 12 at 18:00' },
  { title: 'Design System with Figma', hostName: 'Marie Lemoine', schedule: 'June 14 at 14:00' },
]

export const recentActivities = [
  'Lucas Moreau liked your publication',
  'Emma Dubois commented on your session',
  'New badge unlocked: Mentor',
  'Thomas Bernard sent you a message',
]

export const messages = [
  { senderName: 'Lucas Moreau', preview: 'Hi Sarah! Are you free for a session this week?', time: '10:30' },
  { senderName: 'Emma Dubois', preview: 'Thanks for the session yesterday, it was great!', time: 'Yesterday' },
  { senderName: 'Thomas Bernard', preview: 'I shared useful resources with you.', time: 'June 2' },
  { senderName: 'Marie Lemoine', preview: 'Yes, I will attend the Saturday workshop!', time: 'June 1' },
]

export const notifications = [
  'A student joined your HTML/CSS session.',
  'Your monthly XP goal is 75% complete.',
  'New recommendation: Design System with Figma.',
  'You have 2 pending contact invitations.',
]

export const badges = [
  { title: 'Mentor', level: 2, iconName: 'school-outline' },
  { title: 'Developer', level: 3, iconName: 'rocket-outline' },
  { title: 'Communicator', level: 1, iconName: 'chatbubbles-outline' },
]

export const friends: Array<{ name: string; skill: string }> = []
