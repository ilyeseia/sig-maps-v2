'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if token is present
    if (!token) {
      setValidToken(false);
    } else {
      setValidToken(true);
    }
  }, [token]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'كلمة المرور مطلوبة';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل';
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'كلمة المرور يجب أن تحتوي على حرف كبير';
    } else if (!/[a-z]/.test(formData.newPassword)) {
      newErrors.newPassword = 'كلمة المرور يجب أن تحتوي على حرف صغير';
    } else if (!/[0-9]/.test(formData.newPassword)) {
      newErrors.newPassword = 'كلمة المرور يجب أن تحتوي على رقم';
    }

    // Confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'فشل تغيير كلمة المرور');
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking token
  if (validToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من الرابط...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (validToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              رابط غير صالح
            </h3>
            <p className="text-gray-600 mb-6">
              رابط إعادة تعيين كلمة المرور منتهي الصلاحية أو غير صحيح.
            </p>
            <a href="/forgot-password" className="btn btn-primary">
              طلب رابط جديد
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              تم تغيير كلمة المرور!
            </h3>
            <p className="text-gray-600 mb-6">
              سيتم تحويلك إلى صفحة تسجيل الدخول قريباً...
            </p>
            <div className="animate-pulse">
              <div className="h-1 bg-blue-500 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 animate-pulse w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show form
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
            تغيير كلمة المرور
          </h3>

          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className={`input px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.newPassword ? 'border-red-500' : ''
                }`}
                placeholder="••••••••"
              />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                يجب أن تحتوي على 8 أحرف، حرف كبير، حرف صغير، ورقم
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`input px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.confirmPassword ? 'border-red-500' : ''
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري التغيير...
                </span>
              ) : (
                'تغيير كلمة المرور'
              )}
            </button>
          </form>

          {/* Cancel Link */}
          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-gray-600 hover:text-primary">
              إلغاء والعودة لتسجيل الدخول
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
