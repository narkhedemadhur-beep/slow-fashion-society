import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const Feedback = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/feedback`,
        { message, email: user ? undefined : email },
        { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true 
        }
      );
      toast.success('Thank you for your feedback!');
      setMessage('');
      setEmail('');
    } catch (error) {
      toast.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight mb-4" data-testid="feedback-title">
            Feedback
          </h1>
          <p className="text-lg text-muted-foreground">
            We'd love to hear from you. Share your thoughts, suggestions, or concerns.
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!user && (
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="feedback-email-input"
                  required
                  className="mt-2"
                />
              </div>
            )}
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                data-testid="feedback-message-input"
                required
                rows={6}
                className="mt-2"
              />
            </div>
            <Button
              type="submit"
              data-testid="feedback-submit-button"
              className="w-full rounded-full"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};