export type CatalogApp = {
  package_name: string;
  app_name: string;
  app_icon: string;
  app_category: string;
};

export const APP_CATALOG: CatalogApp[] = [
  { package_name: 'com.instagram.android', app_name: 'Instagram', app_icon: '📷', app_category: 'Social' },
  { package_name: 'com.google.android.youtube', app_name: 'YouTube', app_icon: '▶️', app_category: 'Entertainment' },
  { package_name: 'com.facebook.katana', app_name: 'Facebook', app_icon: '👤', app_category: 'Social' },
  { package_name: 'com.whatsapp', app_name: 'WhatsApp', app_icon: '💬', app_category: 'Communication' },
  { package_name: 'com.zhiliaoapp.musically', app_name: 'TikTok', app_icon: '🎵', app_category: 'Entertainment' },
  { package_name: 'com.twitter.android', app_name: 'X', app_icon: '✖️', app_category: 'Social' },
  { package_name: 'com.reddit.frontpage', app_name: 'Reddit', app_icon: '🟠', app_category: 'Social' },
  { package_name: 'com.snapchat.android', app_name: 'Snapchat', app_icon: '👻', app_category: 'Social' },
  { package_name: 'com.supercell.clashroyale', app_name: 'Clash Royale', app_icon: '👑', app_category: 'Games' },
  { package_name: 'com.mojang.minecraftpe', app_name: 'Minecraft', app_icon: '⛏️', app_category: 'Games' },
  { package_name: 'com.roblox.client', app_name: 'Roblox', app_icon: '🎮', app_category: 'Games' },
  { package_name: 'com.android.chrome', app_name: 'Chrome', app_icon: '🌐', app_category: 'Utilities' },
  { package_name: 'com.netflix.mediaclient', app_name: 'Netflix', app_icon: '🎬', app_category: 'Entertainment' },
  { package_name: 'com.spotify.music', app_name: 'Spotify', app_icon: '🎧', app_category: 'Entertainment' },
  { package_name: 'com.amazon.mShop.android.shopping', app_name: 'Amazon', app_icon: '📦', app_category: 'Shopping' },
  { package_name: 'com.google.android.apps.maps', app_name: 'Maps', app_icon: '🗺️', app_category: 'Utilities' },
  { package_name: 'com.linkedin.android', app_name: 'LinkedIn', app_icon: '💼', app_category: 'Social' },
  { package_name: 'com.pinterest.android', app_name: 'Pinterest', app_icon: '📌', app_category: 'Social' },
  { package_name: 'com.discord', app_name: 'Discord', app_icon: '🗣️', app_category: 'Communication' },
  { package_name: 'com.telegram.messenger', app_name: 'Telegram', app_icon: '✈️', app_category: 'Communication' },
  { package_name: 'com.google.android.gm', app_name: 'Gmail', app_icon: '📧', app_category: 'Utilities' },
  { package_name: 'com.ss.android.ugc.trill', app_name: 'Twitch', app_icon: '🟣', app_category: 'Entertainment' },
  { package_name: 'com.genshin.hoYoLAB', app_name: 'Genshin Impact', app_icon: '⚔️', app_category: 'Games' },
  { package_name: 'com.mobilelegends', app_name: 'Mobile Legends', app_icon: '🛡️', app_category: 'Games' },
];

export const APP_CATEGORIES = ['Social', 'Entertainment', 'Games', 'Communication', 'Utilities', 'Shopping', 'Other'];
