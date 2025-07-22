const bcrypt = require('bcrypt');
const saltRounds = 10;

export const hashPasswordHelper = async (plainPassword: string) => {
    try {
        return await bcrypt.hash(plainPassword, saltRounds);
    } catch (error) {
        console.log(error)
    }
}

export const comparePasswordHelper = async (plainPassword: string, hashPassword: string) => {
    try {
        return await bcrypt.compare(plainPassword, hashPassword);
    } catch (error) {
        console.log(error)
    }
}

export function convertSortStringToObject(sort: string | string[]): Record<string, 1 | -1> {
  const sortObj: Record<string, 1 | -1> = {};

  if (Array.isArray(sort)) {
    for (const key of sort) {
      sortObj[key.replace('-', '')] = key.startsWith('-') ? -1 : 1;
    }
  } else {
    const key = sort.replace('-', '');
    sortObj[key] = sort.startsWith('-') ? -1 : 1;
  }

  return sortObj;
}
