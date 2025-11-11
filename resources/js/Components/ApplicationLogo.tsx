import { ImgHTMLAttributes } from 'react';
import logoUrl from '@/img/logo.webp';

export default function ApplicationLogo(
  { className = 'h-9 w-auto', alt = 'Logo', ...props }: ImgHTMLAttributes<HTMLImageElement>
) {
  return <img src={logoUrl} alt={alt} className={className} {...props} />;
}
