import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from './generated/prisma/client';

function resolveDatasourceUrl(): string | undefined {
	const rawUrl = process.env.DATABASE_URL;
	if (!rawUrl) return undefined;

	if (!rawUrl.startsWith('file:')) return rawUrl;

	const rawPath = rawUrl.slice('file:'.length);
	if (/^[A-Za-z]:[\/]/.test(rawPath)) {
		return `file:${rawPath.replace(/\\/g, '/')}`;
	}

	// Resolve relative SQLite URLs against project roots and prefer existing files.
	if (/^(\.\.?[\\/])/.test(rawPath)) {
		const trimmed = rawPath.replace(/^(\.\.?[\\/])+/, '');
		const candidates = [
			path.resolve(process.cwd(), rawPath),
			path.resolve(process.cwd(), 'prisma', trimmed),
			path.resolve(process.cwd(), 'prisma', 'dev.db'),
		];
		const existing = candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
		return `file:${existing.replace(/\\/g, '/')}`;
	}

	return rawUrl;
}

const datasourceUrl = resolveDatasourceUrl();

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  (datasourceUrl
    ? new PrismaClient({ datasources: { db: { url: datasourceUrl } } })
    : new PrismaClient());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
