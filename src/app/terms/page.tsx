"use client";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">利用規約</h1>
      <div className="space-y-4 text-sm text-gray-300">
        <p>
          本サービス「GLB AR Viewer」（以下「本サービス」といいます）は、ユーザーが自身のGLBファイルをブラウザ上で閲覧・体験できる機能を提供します。
        </p>
        <p>
          <strong>1. 利用条件：</strong> 本サービスは個人利用を目的としており、商用利用または再配布は原則として禁止とします。
        </p>
        <p>
          <strong>2. 禁止事項：</strong> 以下の行為は禁止とします：
          著作権等を侵害するコンテンツのアップロード、不正アクセス、解析、改変、法令または公序良俗に反する行為。
        </p>
        <p>
          <strong>3. 免責事項：</strong> 本サービスの利用により生じたいかなる損害についても、運営者は一切の責任を負いません。
        </p>
        <p>
          <strong>4. 著作権：</strong> 本サービス内のテキスト、コード、デザイン等の著作権は運営者または正当な権利者に帰属します。
        </p>
        <p>
          <strong>5. 準拠法：</strong> 本規約は日本法に準拠し、日本の裁判所を第一審の専属的合意管轄裁判所とします。
        </p>
      </div>
    </div>
  );
}
