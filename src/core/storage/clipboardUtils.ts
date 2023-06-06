export const getClipboard = (): Clipboard | null => {
  return navigator?.clipboard ?? null;
}

export const writeTextToClipboard = async (val: string): Promise<boolean> => {
  const clipboard = getClipboard();

  if (!clipboard)
    return false;

  try {
    await clipboard.writeText(val);
    return true;
  } catch (err) {
    return false;
  }
}