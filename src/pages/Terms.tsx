
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Terms = () => {
  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Acceptance of Terms</h2>
          <p>
            By accessing or using TaskFlow ("the Service"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use the Service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">Description of Service</h2>
          <p>
            TaskFlow is a productivity application that allows users to create and manage projects, 
            tasks, goals, and savings. The Service may be updated or modified from time to time.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">User Accounts</h2>
          <p>
            To use certain features of the Service, you must register for an account. You are responsible 
            for maintaining the confidentiality of your account credentials and for all activities that 
            occur under your account.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">User Content</h2>
          <p>
            Any content you create, upload, or store through the Service remains your property. However, 
            by using the Service, you grant us a license to use, store, and display your content in order 
            to provide and improve the Service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">Prohibited Conduct</h2>
          <p>
            You agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service for any illegal purpose</li>
            <li>Upload harmful content or malware</li>
            <li>Impersonate others or provide false information</li>
            <li>Attempt to gain unauthorized access to other user accounts</li>
            <li>Interfere with the proper functioning of the Service</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-6">Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account and access to the Service at our 
            discretion, with or without notice, particularly for violations of these Terms.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">Disclaimer of Warranties</h2>
          <p>
            The Service is provided "as is" without warranties of any kind, either express or implied.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">Limitation of Liability</h2>
          <p>
            We shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
            resulting from your use of or inability to use the Service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Service after any changes 
            constitutes your acceptance of the new Terms.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mt-2">
            <Link to="/contact" className="text-primary hover:underline">
              Contact Page
            </Link>
          </p>
        </div>
        
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Terms;
