// Central theme tokens (colors, gradients, spacing, radii)
export const colors = {
  bgDark: '#0b1019',
  panel: '#182131',
  panelBorder: '#243249',
  accentA: '#ff6b6b',
  accentB: '#4ecdc4',
  warn: '#ffa94d',
};

export const gradients = {
  accent: `linear-gradient(45deg, ${colors.accentA}, ${colors.accentB})`,
  panel: 'linear-gradient(135deg,#16213e 0%,#1a1a2e 100%)',
};

export const radius = {
  card: '16px',
  pill: '25px'
};

export const shadows = {
  card: '0 6px 18px -8px rgba(0,0,0,0.6)',
  cardHover: '0 12px 28px -6px rgba(0,0,0,0.7)'
};
