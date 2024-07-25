export const userSelect = {
  omit: {
    password: true,
  },
  include: {
    roles: {
      select: {
        role: {
          select: {
            name: true,
          },
        },
      },
    },
  },
};
