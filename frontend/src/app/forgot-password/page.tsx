'use client';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-6">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center">
          نسيت كلمة المرور؟
        </h2>
        <p className="text-center text-gray-600">
          أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
        </p>
      </div>
    </div>
  );
}
