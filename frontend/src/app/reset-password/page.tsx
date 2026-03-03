'use client';

import { useState } from 'react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          إعادة تعيين كلمة المرور
        </h2>
        <div className="mt-8 space-y-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور الجديدة"
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="تأكيد كلمة المرور"
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500"
          />
        </div>
      </div>
    </div>
  );
}
