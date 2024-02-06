import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  const hash = bcrypt.hash(password, salt);
  return hash;
}