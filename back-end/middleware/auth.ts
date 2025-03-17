import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  username: string;
  role: string;
}

// 扩展 NextApiRequest 类型，添加 user 属性
export interface AuthenticatedRequest extends NextApiRequest {
  user?: DecodedToken;
}

type ApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void;

export function authMiddleware(handler: ApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          code: 401,
          message: "未提供token",
          data: null,
        });
      }

      const token = authHeader.split(" ")[1];
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        console.error("警告: JWT_SECRET 环境变量未设置");
        return res.status(500).json({
          code: 500,
          message: "服务器配置错误",
          data: null,
        });
      }

      try {
        const decoded = jwt.verify(token, secret) as DecodedToken;
        req.user = decoded;
        return handler(req, res);
      } catch (error) {
        return res.status(401).json({
          code: 401,
          message: "无效的token",
          data: null,
        });
      }
    } catch (error) {
      console.error("认证中间件错误:", error);
      return res.status(500).json({
        code: 500,
        message: "服务器错误",
        data: null,
      });
    }
  };
}

export function roleCheck(roles: string[]) {
  return (handler: ApiHandler) => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      try {
        const user = req.user;

        if (!user) {
          return res.status(401).json({
            code: 401,
            message: "请先登录",
            data: null,
          });
        }

        if (!roles.includes(user.role)) {
          return res.status(403).json({
            code: 403,
            message: "权限不足",
            data: null,
          });
        }

        return handler(req, res);
      } catch (error) {
        console.error("角色检查中间件错误:", error);
        return res.status(500).json({
          code: 500,
          message: "服务器错误",
          data: null,
        });
      }
    };
  };
}
