export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2>Acceptance of Terms</h2>
            <p>By accessing and using Blogify, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h2>Content Guidelines</h2>
            <p>Users are responsible for their content and must not post anything that is illegal, harmful, or violates others' rights.</p>
            
            <h2>Account Responsibilities</h2>
            <p>You are responsible for maintaining the security of your account and for all activities that occur under your account.</p>
            
            <h2>Contact Information</h2>
            <p>For questions about these Terms of Service, contact us at legal@blogify.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
