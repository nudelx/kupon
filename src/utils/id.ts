const take = (value: string, length: number) => value.slice(0, length);

export const createJoinCode = () => take(crypto.randomUUID().replace(/-/g, ''), 8);

export const createShareSlug = () => take(crypto.randomUUID().replace(/-/g, ''), 12);
