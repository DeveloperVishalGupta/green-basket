'use client';

import { useRouter } from 'next/navigation';
import { Button, Result } from 'antd';
import { LockOutlined } from '@ant-design/icons';

/**
 * Unauthorized Access Page
 * Shown when user tries to access a page they don't have permission for
 */
export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <Result
          status="403"
          icon={<LockOutlined style={{ fontSize: 72, color: '#ef4444' }} />}
          title={<span className="text-2xl font-bold">Access Denied</span>}
          subTitle={
            <div className="text-gray-600 space-y-2">
              <p>You don&apos;t have permission to access this page.</p>
              <p className="text-sm">If you believe this is an error, please contact support.</p>
            </div>
          }
          extra={[
            <Button
              key="back"
              onClick={() => router.back()}
              size="large"
            >
              Go Back
            </Button>,
            <Button
              key="home"
              type="primary"
              onClick={() => router.push('/')}
              size="large"
            >
              Go Home
            </Button>,
          ]}
        />
      </div>
    </div>
  );
}
