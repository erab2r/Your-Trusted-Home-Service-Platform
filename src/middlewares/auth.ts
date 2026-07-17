import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";

import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const token =
        req.cookies.accessToken ??
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.split(" ")[1]
          : req.headers.authorization);

      // Token not found
      if (!token) {
        const error: any = new Error("You are not authorized.");
        error.statusCode = httpStatus.UNAUTHORIZED;
        throw error;
      }

      const verifiedToken = jwtUtils.verifyToken(
        token,
        config.jwt_access_secret
      );

      // Invalid token
      if (!verifiedToken.success) {
        const error: any = new Error(verifiedToken.error);
        error.statusCode = httpStatus.UNAUTHORIZED;
        throw error;
      }

      const { id, name, email, role } =
        verifiedToken.data as JwtPayload;

      // Role permission check
      if (
        requiredRoles.length &&
        !requiredRoles.includes(role)
      ) {
        const error: any = new Error(
          "Forbidden. You don't have permission to access this resource."
        );
        error.statusCode = httpStatus.FORBIDDEN;
        throw error;
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      // User not found
      if (!user) {
        const error: any = new Error("User not found.");
        error.statusCode = httpStatus.NOT_FOUND;
        throw error;
      }

      // Blocked user
      if (user.activeStatus === "BLOCKED") {
        const error: any = new Error(
          "Your account has been blocked. Please contact the administrator."
        );
        error.statusCode = httpStatus.FORBIDDEN;
        throw error;
      }

      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      next();
    }
  );
};