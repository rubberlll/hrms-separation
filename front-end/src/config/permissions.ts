// 定义角色类型
export type RoleType = "admin" | "hr" | "employee" | "user";

// 定义权限配置
export const routePermissions = {
  "/": ["admin", "hr", "employee", "user"],
  "/user": ["admin", "hr"],
  "/user/:userId": ["admin", "hr"], // 用户详情页权限
  "/recruitment/resume": ["admin", "hr"],
  "/recruitment/jobs": ["admin", "hr"],
  "/recruitment/apply": ["admin", "hr", "employee", "user"], // 申请职位页面，所有用户都可以访问
  "/recruitment/my-applications": ["admin", "hr", "employee", "user"], // 我的申请页面，所有用户都可以访问
  "/permission-management": ["admin"], // 权限管理页面，只有管理员可以访问
  "/login": ["*"], // 登录页面所有人都可以访问
  "/403": ["*"], // 403页面所有人都可以访问
  "/notfound": ["*"], // 404页面所有人都可以访问
  "/department": ["admin", "hr"], // 部门管理页面，只有管理员和HR可以访问
};

/**
 * 检查用户是否有权限访问特定路由
 * @param role 用户角色
 * @param path 请求路径
 * @returns 是否有权限
 */
export const hasPermission = (role: RoleType, path: string): boolean => {
  // 处理动态路由参数
  const normalizedPath = normalizePath(path);

  // 先尝试精确匹配
  if (routePermissions[normalizedPath as keyof typeof routePermissions]) {
    const permissions =
      routePermissions[normalizedPath as keyof typeof routePermissions];
    return permissions.includes("*") || permissions.includes(role);
  }

  // 如果没有精确匹配，尝试匹配动态路由
  for (const route in routePermissions) {
    if (isPathMatch(route, normalizedPath)) {
      const permissions =
        routePermissions[route as keyof typeof routePermissions];
      return permissions.includes("*") || permissions.includes(role);
    }
  }

  return false;
};

// 辅助函数：标准化路径
function normalizePath(path: string): string {
  // 移除尾部斜杠
  return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
}

// 辅助函数：检查路径是否匹配（支持动态路由参数）
function isPathMatch(pattern: string, path: string): boolean {
  // 如果模式中包含参数（如 /user/:id）
  if (pattern.includes(":")) {
    const patternParts = pattern.split("/");
    const pathParts = path.split("/");

    if (patternParts.length !== pathParts.length) return false;

    for (let i = 0; i < patternParts.length; i++) {
      // 如果是参数部分（以:开头），则跳过比较
      if (patternParts[i].startsWith(":")) continue;
      // 否则进行精确匹配
      if (patternParts[i] !== pathParts[i]) return false;
    }

    return true;
  }

  return pattern === path;
}
