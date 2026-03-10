import type { Metadata } from 'next'
import { ApiDocClient } from './ApiDocClient'

export const metadata: Metadata = {
  title: 'API Documentation',
  description:
    'Tài liệu API công khai của Nghiền Phim. Tích hợp kho phim hơn 34.000 bộ vào ứng dụng của bạn. RESTful API, miễn phí, không cần xác thực.',
}

export default function ApiDocPage() {
  return <ApiDocClient />
}
