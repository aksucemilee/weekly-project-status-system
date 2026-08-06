export const layoutTokens = {
  page: {
    maxWidth: "xl",
    contentMaxWidth: 1440,

    paddingX: {
      xs: 2,
      sm: 2.5,
      md: 3,
      lg: 4,
    },

    paddingY: {
      xs: 2,
      sm: 2.5,
      md: 3,
    },
  },

  spacing: {
    pageHeader: {
      xs: 2,
      md: 2.5,
    },

    section: {
      xs: 2,
      md: 2.5,
    },

    cardGrid: {
      xs: 1.5,
      md: 2,
    },
  },

  grids: {
    cards: {
      xs: "1fr",
      md: "repeat(2, minmax(0, 1fr))",
    },

    compactCards: {
      xs: "1fr",
      md: "repeat(2, minmax(0, 1fr))",
      xl: "repeat(3, minmax(0, 1fr))",
    },

    metrics: {
      xs: "1fr",
      sm: "repeat(2, minmax(0, 1fr))",
      lg: "repeat(3, minmax(0, 1fr))",
      xl: "repeat(5, minmax(0, 1fr))",
    },

    summary: {
      xs: "repeat(2, minmax(0, 1fr))",
      md: "repeat(4, minmax(0, 1fr))",
    },

    form: {
      xs: "1fr",
      md: "repeat(2, minmax(0, 1fr))",
    },
  },

  dialog: {
    formMaxWidth: "md",
  },
} as const;