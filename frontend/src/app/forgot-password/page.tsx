import React from 'react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            نسيت كلمة المرور
          </h2>
          <p className="text-gray-600">
            أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="example@email.com"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            إرسال رابط إعادة التعيين
          </button>

          <div className="text-center text-sm">
            <a
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              العودة لتسجيل الدخول
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
