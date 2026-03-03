'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            تسجيل حساب جديد
          </h2>
          <p className="text-gray-600">انضم إلى SIG Maps V2</p>
        </div>
      </div>
    </div>
  );
}
