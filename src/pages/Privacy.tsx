
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Privacy = () => {
  return (
    <div className="container max-w-4xl py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Introduction</h2>
          <p>
            TaskFlow ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, and safeguard your information when you use our application.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create an account</li>
            <li>Create or modify projects, tasks, and goals</li>
            <li>Set savings goals and track financial information</li>
            <li>Communicate with us</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-6">How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your experience</li>
            <li>Communicate with you about your account and updates</li>
            <li>Monitor and analyze usage patterns</li>
            <li>Protect against unauthorized access</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-6">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. 
            However, no method of transmission or storage is 100% secure, and we cannot guarantee 
            absolute security.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, 
            including the right to access, correct, or delete your data.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page.
          </p>
          
          <h2 className="text-2xl font-semibold mt-6">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
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

export default Privacy;
