
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AtSign, Mail, MapPin, Phone } from 'lucide-react';

// Define the contact form schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, you would send this data to your backend
      console.log('Contact form submission:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Message sent!',
        description: 'We have received your message and will get back to you soon.',
      });
      
      form.reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: 'Something went wrong',
        description: 'Failed to send your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Contact Us</h1>
            <p className="mt-2 text-muted-foreground">
              Have questions, feedback, or need support? We're here to help.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <Mail className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">support@taskflow.example.com</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Phone className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-muted-foreground">(123) 456-7890</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <MapPin className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <h3 className="font-medium">Address</h3>
                <p className="text-muted-foreground">
                  123 Productivity Lane<br />
                  Suite 456<br />
                  San Francisco, CA 94103
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <AtSign className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <h3 className="font-medium">Social Media</h3>
                <div className="flex space-x-3 mt-1">
                  <a href="#" className="text-muted-foreground hover:text-primary">Twitter</a>
                  <a href="#" className="text-muted-foreground hover:text-primary">LinkedIn</a>
                  <a href="#" className="text-muted-foreground hover:text-primary">Instagram</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email address" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="What is this regarding?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How can we help you?" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <p className="text-xs text-muted-foreground">
              We'll never share your contact information.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
