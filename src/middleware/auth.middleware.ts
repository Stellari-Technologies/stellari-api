/**
 * ============================================================================
 * AUTH MIDDLEWARE
 * ============================================================================
 *
 * Three middleware functions for protecting routes:
 *
 * 1. requireAuth
 *    → verifies the Cognito JWT access token
 *    → finds the user in the database
 *    → sets req.user for downstream route handlers
 *    → used on ALL protected routes
 *
 * 2. requireOrgAccess
 *    → checks the user is a member of the org in the URL
 *    → sets req.membership for downstream route handlers
 *    → used on all /api/organizations/:orgId/* routes
 *
 * 3. requireOwner
 *    → checks userType = account_owner
 *    → used on owner-only routes (creating staff, deleting rewards etc)
 *
 * USAGE:
 *   router.get('/participants', requireAuth, requireOrgAccess, controller.getAll);
 *   router.post('/staff', requireAuth, requireOrgAccess, requireOwner, controller.create);
 *
 * ============================================================================
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import {
  OrganizationMembership,
  UserType,
} from "../entities/OrganizationMembership";
import { AppError } from "./error.middleware";
import { HTTP_STATUS, ERROR_CODES } from "../constants";

// ─── Extend Express Request type ─────────────────────────────────────────────
// This tells TypeScript that req.user and req.membership exist
// Without this TypeScript would throw an error when we try to set them
declare global {
  namespace Express {
    interface Request {
      user?: User;
      membership?: OrganizationMembership;
    }
  }
}

// ─── JWKS Client ─────────────────────────────────────────────────────────────
// This client fetches and CACHES Cognito's public keys
// cache: true means it only hits the JWKS endpoint once then stores the keys
// cacheMaxAge: 10 hours — keys rarely rotate so this is safe
const jwksClientInstance = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  cacheMaxAge: 36000000, // 10 hours in milliseconds
});

// ─── Helper: get signing key from JWKS ───────────────────────────────────────
// This function takes the kid from the JWT header
// and returns the matching public key from Cognito
const getSigningKey = (kid: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwksClientInstance.getSigningKey(
      kid,
      (err: Error | null, key: jwksClient.SigningKey | undefined) => {
        if (err) {
          reject(err);
          return;
        }
        const signingKey = key?.getPublicKey();
        if (!signingKey) {
          reject(new Error("Could not get signing key"));
          return;
        }
        resolve(signingKey);
      },
    );
  });
};

// ─── Middleware 1: requireAuth ────────────────────────────────────────────────
/**
 * Verifies the JWT access token and finds the user in the database.
 * Sets req.user if successful.
 *
 * @example
 *   router.get('/dashboard', requireAuth, controller.getDashboard);
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Step 1 — extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "No token provided",
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    // "Bearer eyJhbGci..." → "eyJhbGci..."
    const token = authHeader.split(" ")[1];

    // Step 2 — decode the JWT header to get the kid
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || typeof decodedHeader === "string") {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid token format",
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    const kid = decodedHeader.header.kid;
    if (!kid) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid token — no kid in header",
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    // Step 3 — fetch the matching public key from Cognito JWKS (cached)
    const publicKey = await getSigningKey(kid);

    // Step 4 — verify the token signature, expiry, and issuer
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
      issuer: `https://cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
    }) as jwt.JwtPayload;

    // Step 5 — try to find user in database
    // user may not exist yet if this is their first request (setup flow)
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { cognitoSub: decoded.sub },
    });

    // Step 6 — attach whatever we have to req
    // setup endpoint will create the user row if it doesn't exist
    // other endpoints will handle missing user as needed
    req.user =
      user ||
      ({
        id: "",
        cognitoSub: decoded.sub,
        email: decoded.email || decoded["cognito:username"] || "",
        firstName: "",
        lastName: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        memberships: [],
        transactions: [],
      } as User);

    next();
  } catch (error) {
    // if it's already an AppError pass it through
    if (error instanceof AppError) {
      return next(error);
    }

    // handle JWT specific errors
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new AppError(
          HTTP_STATUS.UNAUTHORIZED,
          "Token has expired",
          ERROR_CODES.UNAUTHORIZED,
        ),
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(
        new AppError(
          HTTP_STATUS.UNAUTHORIZED,
          "Invalid token",
          ERROR_CODES.UNAUTHORIZED,
        ),
      );
    }

    // unexpected error
    next(error);
  }
};

// ─── Middleware 2: requireOrgAccess ──────────────────────────────────────────
/**
 * Checks the user is a member of the org in the URL params.
 * Sets req.membership if successful.
 * Must be used AFTER requireAuth.
 *
 * @example
 *   router.get('/participants', requireAuth, requireOrgAccess, controller.getAll);
 */
export const requireOrgAccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // requireAuth must run first to set req.user
    if (!req.user) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Not authenticated",
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    const { orgId } = req.params;

    if (!orgId) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        "Organization ID is required",
        ERROR_CODES.INVALID_INPUT,
      );
    }

    // find the membership row linking this user to this org
    const membershipRepository = AppDataSource.getRepository(
      OrganizationMembership,
    );
    const membership = await membershipRepository.findOne({
      where: {
        user: { id: req.user.id },
        organization: { id: orgId },
      },
      relations: ["organization"],
    });

    if (!membership) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        "You are not a member of this organization",
        ERROR_CODES.FORBIDDEN,
      );
    }

    // attach membership to request for downstream handlers
    req.membership = membership;

    next();
  } catch (error) {
    next(error);
  }
};

// ─── Middleware 3: requireOwner ───────────────────────────────────────────────
/**
 * Checks the user is an account_owner in this org.
 * Must be used AFTER requireAuth and requireOrgAccess.
 *
 * @example
 *   router.post('/staff', requireAuth, requireOrgAccess, requireOwner, controller.create);
 */
export const requireOwner = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.membership) {
      throw new AppError(
        HTTP_STATUS.UNAUTHORIZED,
        "Not authenticated",
        ERROR_CODES.UNAUTHORIZED,
      );
    }

    if (req.membership.userType !== UserType.ACCOUNT_OWNER) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        "Only account owners can perform this action",
        ERROR_CODES.FORBIDDEN,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
