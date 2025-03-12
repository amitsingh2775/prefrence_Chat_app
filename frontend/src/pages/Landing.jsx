import React, { useState } from 'react';
import { MessageSquare, Users, Shield, Globe2, ZoomIn, ZoomOut, Bell, X, ArrowRight } from 'lucide-react';

const LandingPage = ({ onGetStarted }) => {
  const [showNote, setShowNote] = useState(false);
  const [zoom, setZoom] = useState(100);

  const scrollToAbout = (e) => {
    e.preventDefault();
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleZoom = (direction) => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev + 10 : prev - 10;
      return Math.min(Math.max(newZoom, 50), 150);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white" style={{ zoom: `${zoom}%` }}>
      {/* Fixed Controls */}
      <div className="fixed right-6 top-24 flex flex-col gap-4 z-50">
        <button 
          onClick={() => setShowNote(true)}
          className="bg-blue-600 p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg group relative"
        >
          <Bell className="h-6 w-6" />
          <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Show Instructions
          </span>
        </button>
        <button 
          onClick={() => handleZoom('in')}
          className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors shadow-lg"
        >
          <ZoomIn className="h-6 w-6" />
        </button>
        <button 
          onClick={() => handleZoom('out')}
          className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors shadow-lg"
        >
          <ZoomOut className="h-6 w-6" />
        </button>
      </div>

      {/* Instructions Popup */}
      {showNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full relative">
            <button 
              onClick={() => setShowNote(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold mb-4 text-blue-400">Instructions & Notes</h3>
            <div className="space-y-4 text-gray-300">
              <p>👋 Welcome to ConnectMatch! Here's how to get started:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Click "Get Started" to create your account</li>
                <li>Fill in your interests and preferences</li>
                <li>Browse matches based on shared interests</li>
                <li>Start meaningful conversations!</li>
              </ol>
              <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                <p className="text-sm">
                  <strong>Note:</strong> Use the zoom controls on the right to adjust the page size for better visibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the content */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">ConnectMatch</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">Features</a>
            <a href="#about" className="text-gray-300 hover:text-blue-400 transition-colors">About</a>
            <a href="#contact" className="text-gray-300 hover:text-blue-400 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
              Connect with People Who Share Your Interests
            </h1>
            <p className="mt-6 text-xl text-gray-300">
              Join meaningful conversations with people who are passionate about the same things you are.
            </p>
            <div className="mt-8 flex space-x-4">
              <button 
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button onClick={scrollToAbout} className="border-2 border-blue-400 text-blue-400 px-8 py-3 rounded-full hover:bg-blue-400/10 transition-colors">
                Learn More
              </button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1611746872915-64382b5c76da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
              alt="Chat interface"
              className="rounded-2xl shadow-2xl ring-1 ring-gray-700"
            />
            <div className="absolute inset-0 bg-blue-900/20 rounded-2xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-gray-800/50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Why Choose ConnectMatch?
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<Users className="h-8 w-8 text-blue-400" />}
              title="Interest Matching"
              description="Our smart algorithm connects you with people who share your specific interests and hobbies."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-blue-400" />}
              title="Safe & Secure"
              description="Advanced security measures to ensure your conversations remain private and protected."
            />
            <FeatureCard
              icon={<Globe2 className="h-8 w-8 text-blue-400" />}
              title="Global Community"
              description="Connect with like-minded individuals from around the world, breaking geographical barriers."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1600783486018-e5909469e11e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
                alt="Mobile chat app"
                className="rounded-2xl shadow-xl ring-1 ring-gray-700"
              />
              <div className="absolute inset-0 bg-blue-900/20 rounded-2xl"></div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Our Mission
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                We believe that meaningful connections shouldn't be left to chance. Our platform is designed to bring together people with shared interests, fostering genuine relationships and engaging conversations.
              </p>
              <p className="text-lg text-gray-300">
                Whether you're passionate about photography, love discussing books, or want to connect with fellow tech enthusiasts, ConnectMatch helps you find your tribe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900/50 py-12 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <MessageSquare className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">ConnectMatch</span>
              </div>
              <p className="text-gray-400">
                Connecting people through shared interests and meaningful conversations.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-blue-400 transition-colors">About</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Connect</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 ConnectMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-6 bg-gray-800/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-700">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-blue-400 mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

export default LandingPage;