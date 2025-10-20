/**
 * Route path constants for the application
 * Centralized route definitions to avoid hardcoded strings
 */

const getBasePath = () => {
  return "/kupon/";
};

export const ROUTES = {
  HOME: getBasePath(),
  GROUPS: "groups/:groupId",
  SHARE: "/share/:slug",
} as const;

/**
 * Helper functions to build dynamic routes
 */
export const buildGroupPath = (groupId: string) =>
  `${ROUTES.HOME}/groups/${groupId}`;
export const buildSharePath = (slug: string) => `/share/${slug}`;
