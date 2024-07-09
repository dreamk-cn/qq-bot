import path from 'path';
import { URL } from 'url';

export function getImagePath(filePath: string) {
  console.log(__dirname);
  // 假设你的图片位于项目的public/images目录下
  const imagePath = path.join(__dirname, 'src', '..', '..', filePath);

  // 将绝对路径转换为file URI格式
  const fileUri = new URL(imagePath).toString();

  console.log(fileUri);
  return fileUri;
}