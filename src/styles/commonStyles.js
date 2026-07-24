export const getCommonStyles = (theme) => ({
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    padding: '2rem',
  },
  paper: {
    backgroundColor: theme.colors.paper,
    color: theme.colors.text,
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    color: theme.colors.text,
    borderRadius: '8px',
    border: `1px solid ${theme.colors.border}`,
  },
  title: {
    color: theme.colors.text,
    fontWeight: 700,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontWeight: 400,
  },
  button: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.text,
    '&:hover': {
      backgroundColor: theme.colors.hover,
    },
  },
  input: {
    backgroundColor: theme.colors.paper,
    color: theme.colors.text,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colors.border,
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colors.primary,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.colors.primary,
    },
  },
  table: {
    '& .MuiTableCell-head': {
      backgroundColor: theme.colors.cardBg,
      color: theme.colors.text,
      fontWeight: 600,
    },
    '& .MuiTableCell-body': {
      color: theme.colors.text,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    '& .MuiTableRow-root:hover': {
      backgroundColor: theme.colors.hover,
    },
  },
  chart: {
    backgroundColor: theme.colors.cardBg,
    '& .recharts-cartesian-grid-horizontal line, & .recharts-cartesian-grid-vertical line': {
      stroke: theme.colors.chartGrid,
    },
    '& .recharts-text': {
      fill: theme.colors.chartText,
    },
  },
  dialog: {
    '& .MuiDialog-paper': {
      backgroundColor: theme.colors.paper,
      color: theme.colors.text,
    },
  },
  divider: {
    backgroundColor: theme.colors.divider,
  },
});
