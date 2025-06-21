"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-indigo-400 mb-6">プライバシーポリシー</h1>
      <div className="space-y-4 text-sm text-gray-300">
        <p>
          本サービス「GLB AR Viewer」では、以下のとおりユーザーのプライバシーを尊重し、個人情報の保護に努めます。
        </p>
        <p>
          <strong>1. 収集する情報：</strong> ユーザーがアップロードしたGLBファイルはブラウザ内でのみ処理され、サーバーに送信・保存することは一切ありません。
        </p>
        <p>
          <strong>2. 外部サービスの利用：</strong> WebXRやLaunchARなどの外部SDKを利用する場合があります。これらのプライバシーポリシーについては各サービス提供元をご確認ください。
        </p>
        <p>
          <strong>3. Cookie等の使用：</strong> 本サービスではGoogle Analytics等のトラッキングを行っておりません。
        </p>
        <p>
          <strong>4. お問い合わせ：</strong> ご質問やご要望は contact@example.com までご連絡ください。
        </p>
        <p>
          <strong>5. 改定：</strong> 本ポリシーは予告なく変更されることがあります。最新版は本ページで随時ご確認ください。
        </p>
      </div>
    </div>
  );
}
