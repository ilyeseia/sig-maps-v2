'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3001/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setSuccess(true);
    } catch (error) {
      console.error('Password reset request failed:', error);
      // Still show success to avoid revealing email existence
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
            SIG Maps V2
          </h2>
          <p className="text-sm text-gray-600">
            نظام معلومات جغرافي متعدد اللغات
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-semibold mb-6 text-center">
            نسيت كلمة المرور؟
          </h3>

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="font-medium">تم الإرسال!</p>
                </div>
                <p className="mt-2 text-sm">
                  إذا كان البريد الإلكتروني {email} مسجلاً، فسيتم إرسال رابط إعادة تعيين كلمة المرور إليه.
                </p>
              </div>
              <a href="/login" className="btn btn-primary w-full">
                العودة لتسجيل الدخول
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="example@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
              </button>

              <div className="text-center">
                <a href="/login" className="text-sm text-primary hover:text-primary-hover">
                  العودة لتسجيل الدخول
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
