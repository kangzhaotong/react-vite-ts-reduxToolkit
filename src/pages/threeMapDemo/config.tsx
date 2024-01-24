export const pxfix = (width: number, fontSize: number) => {
  const clientWidth = document.body.clientWidth;
  const size = (clientWidth / width) * fontSize;
  return size;
};
