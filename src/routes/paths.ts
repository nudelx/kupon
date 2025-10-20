/**
 * Route path constants for the application
 * Centralized route definitions to avoid hardcoded strings
 */

const getBasePath = () => {
  return "/kupon";
};

const BASE_PATH = getBasePath();

export const ROUTES = {
  HOME: BASE_PATH,
  GROUPS: "groups/:groupId",
  SHARE: "share/:slug",
} as const;

/**
 * Helper functions to build dynamic routes
 */
export const buildGroupPath = (groupId: string) =>
  `${BASE_PATH}/groups/${groupId}`;
export const buildSharePath = (slug: string) => `${BASE_PATH}/share/${slug}`;
