export const getCommonStyles = (theme) => {
  const c = theme?.colors || theme || {};
  return {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: c.background || '#0B0F17',
      padding: { xs: '1rem', md: '2rem' },
    },
    glassPaper: {
      backgroundColor: c.glassBg || 'rgba(17, 25, 39, 0.75)',
      backdropFilter: c.glassBlur || 'blur(16px)',
      color: c.text || '#F8FAFC',
      borderRadius: '16px',
      border: c.glassBorder || '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: c.cardShadow || '0 10px 30px -5px rgba(0,0,0,0.5)',
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    paper: {
      backgroundColor: c.paper || '#111927',
      color: c.text || '#F8FAFC',
      borderRadius: '16px',
      border: `1px solid ${c.border || 'rgba(255, 255, 255, 0.1)'}`,
      boxShadow: c.cardShadow || '0 10px 30px -5px rgba(0,0,0,0.5)',
    },
    card: {
      backgroundColor: c.cardBg || '#152032',
      color: c.text || '#F8FAFC',
      borderRadius: '16px',
      border: `1px solid ${c.border || 'rgba(255, 255, 255, 0.1)'}`,
      boxShadow: c.cardShadow || '0 10px 30px -5px rgba(0,0,0,0.5)',
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: c.cardShadowHover,
      },
    },
    title: {
      color: c.text || '#F8FAFC',
      fontWeight: 700,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      letterSpacing: '-0.02em',
    },
    subtitle: {
      color: c.textSecondary || '#94A3B8',
      fontWeight: 400,
      fontSize: '0.95rem',
    },
    gradientButton: {
      background: c.gradientPrimary || 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: '#FFFFFF',
      fontWeight: 600,
      borderRadius: '10px',
      padding: '8px 20px',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      '&:hover': {
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
        transform: 'translateY(-1px)',
      },
    },
    outlinedButton: {
      color: c.text || '#F8FAFC',
      borderColor: c.border || 'rgba(255, 255, 255, 0.12)',
      borderRadius: '10px',
      padding: '8px 18px',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: c.primary || '#10B981',
        backgroundColor: c.hover || 'rgba(255, 255, 255, 0.05)',
        transform: 'translateY(-1px)',
      },
    },
    input: {
      backgroundColor: c.paper || '#111927',
      color: c.text || '#F8FAFC',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: c.border || 'rgba(255, 255, 255, 0.12)',
        borderRadius: '10px',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: c.primary || '#10B981',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: c.primary || '#10B981',
      },
    },
    table: {
      '& .MuiTableCell-head': {
        backgroundColor: c.surfaceElevated || '#1E293B',
        color: c.text || '#F8FAFC',
        fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        borderBottom: `1px solid ${c.border || 'rgba(255, 255, 255, 0.12)'}`,
      },
      '& .MuiTableCell-body': {
        color: c.text || '#F8FAFC',
        borderBottom: `1px solid ${c.divider || 'rgba(255, 255, 255, 0.08)'}`,
      },
      '& .MuiTableRow-root': {
        transition: 'background-color 0.2s ease',
      },
      '& .MuiTableRow-root:hover': {
        backgroundColor: c.hover || 'rgba(255, 255, 255, 0.05)',
      },
    },
    chart: {
      backgroundColor: c.cardBg || '#152032',
      borderRadius: '16px',
      padding: '16px',
      '& .recharts-cartesian-grid-horizontal line, & .recharts-cartesian-grid-vertical line': {
        stroke: c.chartGrid || 'rgba(255, 255, 255, 0.07)',
      },
      '& .recharts-text': {
        fill: c.chartText || '#94A3B8',
        fontSize: '12px',
      },
    },
    dialog: {
      '& .MuiDialog-paper': {
        backgroundColor: c.paper || '#111927',
        color: c.text || '#F8FAFC',
        borderRadius: '20px',
        border: `1px solid ${c.border || 'rgba(255, 255, 255, 0.12)'}`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      },
    },
    divider: {
      backgroundColor: c.divider || 'rgba(255, 255, 255, 0.08)',
    },
  };
};
