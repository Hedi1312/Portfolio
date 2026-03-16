import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiTailwindcss,
  SiDocker,
  SiPrisma,
  SiGit,
  SiNodedotjs,
  SiPython,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiFirebase,
  SiVercel,
  SiFigma,
  SiGraphql,
  SiLinux,
  SiNginx,
  SiGithub,
  SiGitlab,
  SiRust,
  SiGo,
  SiPhp,
  SiLaravel,
  SiExpress,
  SiFlutter,
  SiDart,
  SiKotlin,
  SiSwift,
  SiHtml5,
  SiSass,
  SiJest,
  SiVitest,
  SiWebpack,
  SiVite,
  SiSupabase,
  SiCloudinary,
  SiNestjs,
  SiAmazon,
  SiResend,
} from 'react-icons/si';
import type { IconType } from 'react-icons';

export interface SkillIconEntry {
  icon: IconType;
  color: string; // Couleur en mode sombre
  colorLight?: string; // Couleur en mode clair (si différente)
  label: string; // Nom correctement mis en forme (ex: "Next.js")
}

// Clés en minuscules pour le matching
export const SKILL_ICONS: Record<string, SkillIconEntry> = {
  react: { icon: SiReact, color: '#61DAFB', label: 'React' },
  'next.js': { icon: SiNextdotjs, color: '#ffffff', colorLight: '#000000', label: 'Next.js' },
  nextjs: { icon: SiNextdotjs, color: '#ffffff', colorLight: '#000000', label: 'Next.js' },
  typescript: { icon: SiTypescript, color: '#3178C6', label: 'TypeScript' },
  javascript: { icon: SiJavascript, color: '#F7DF1E', colorLight: '#B8A100', label: 'JavaScript' },
  tailwind: { icon: SiTailwindcss, color: '#06B6D4', label: 'Tailwind CSS' },
  tailwindcss: { icon: SiTailwindcss, color: '#06B6D4', label: 'Tailwind CSS' },
  docker: { icon: SiDocker, color: '#2496ED', label: 'Docker' },
  prisma: { icon: SiPrisma, color: '#5A67D8', colorLight: '#2D3748', label: 'Prisma' },
  git: { icon: SiGit, color: '#F05032', label: 'Git' },
  'node.js': { icon: SiNodedotjs, color: '#339933', label: 'Node.js' },
  nodejs: { icon: SiNodedotjs, color: '#339933', label: 'Node.js' },
  python: { icon: SiPython, color: '#3776AB', label: 'Python' },
  vue: { icon: SiVuedotjs, color: '#4FC08D', label: 'Vue.js' },
  'vue.js': { icon: SiVuedotjs, color: '#4FC08D', label: 'Vue.js' },
  angular: { icon: SiAngular, color: '#DD0031', label: 'Angular' },
  svelte: { icon: SiSvelte, color: '#FF3E00', label: 'Svelte' },
  postgresql: { icon: SiPostgresql, color: '#4169E1', label: 'PostgreSQL' },
  postgres: { icon: SiPostgresql, color: '#4169E1', label: 'PostgreSQL' },
  mongodb: { icon: SiMongodb, color: '#47A248', label: 'MongoDB' },
  redis: { icon: SiRedis, color: '#DC382D', label: 'Redis' },
  firebase: { icon: SiFirebase, color: '#FFCA28', colorLight: '#DD9900', label: 'Firebase' },
  vercel: { icon: SiVercel, color: '#ffffff', colorLight: '#000000', label: 'Vercel' },
  figma: { icon: SiFigma, color: '#F24E1E', label: 'Figma' },
  graphql: { icon: SiGraphql, color: '#E10098', label: 'GraphQL' },
  linux: { icon: SiLinux, color: '#FCC624', colorLight: '#C8A000', label: 'Linux' },
  nginx: { icon: SiNginx, color: '#009639', label: 'Nginx' },
  github: { icon: SiGithub, color: '#ffffff', colorLight: '#181717', label: 'GitHub' },
  gitlab: { icon: SiGitlab, color: '#FC6D26', label: 'GitLab' },
  rust: { icon: SiRust, color: '#ffffff', colorLight: '#000000', label: 'Rust' },
  go: { icon: SiGo, color: '#00ADD8', label: 'Go' },
  golang: { icon: SiGo, color: '#00ADD8', label: 'Go' },
  php: { icon: SiPhp, color: '#777BB4', label: 'PHP' },
  laravel: { icon: SiLaravel, color: '#FF2D20', label: 'Laravel' },
  express: { icon: SiExpress, color: '#ffffff', colorLight: '#000000', label: 'Express' },
  'express.js': { icon: SiExpress, color: '#ffffff', colorLight: '#000000', label: 'Express' },
  flutter: { icon: SiFlutter, color: '#02569B', label: 'Flutter' },
  dart: { icon: SiDart, color: '#0175C2', label: 'Dart' },
  kotlin: { icon: SiKotlin, color: '#7F52FF', label: 'Kotlin' },
  swift: { icon: SiSwift, color: '#F05138', label: 'Swift' },
  html: { icon: SiHtml5, color: '#E34F26', label: 'HTML5' },
  sass: { icon: SiSass, color: '#CC6699', label: 'Sass' },
  scss: { icon: SiSass, color: '#CC6699', label: 'Sass' },
  jest: { icon: SiJest, color: '#C21325', label: 'Jest' },
  vitest: { icon: SiVitest, color: '#6E9F18', label: 'Vitest' },
  webpack: { icon: SiWebpack, color: '#8DD6F9', colorLight: '#1C78C0', label: 'Webpack' },
  vite: { icon: SiVite, color: '#646CFF', label: 'Vite' },
  supabase: { icon: SiSupabase, color: '#3ECF8E', label: 'Supabase' },
  cloudinary: { icon: SiCloudinary, color: '#3448C5', colorLight: '#1E33C6', label: 'Cloudinary' },
  aws: { icon: SiAmazon, color: '#FF9900', label: 'AWS' },
  nestjs: { icon: SiNestjs, color: '#EA2845', label: 'NestJS' },
  resend: { icon: SiResend, color: '#ffffff', colorLight: '#000000', label: 'Resend' },
};

/**
 * Cherche une icône correspondant au nom de compétence donné.
 * Retourne l'entrée du dictionnaire ou undefined si pas trouvée.
 */
export function findSkillIcon(name: string): SkillIconEntry | undefined {
  return SKILL_ICONS[name.toLowerCase().trim()];
}

/**
 * Retourne la liste des noms de compétences disponibles dans le dictionnaire.
 */
export function getAvailableSkillNames(): string[] {
  return Object.keys(SKILL_ICONS);
}
