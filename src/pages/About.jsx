import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  UserGroupIcon,
  HeartIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

export default function About() {
  const features = [
    {
      icon: BookOpenIcon,
      title: "Rich Writing Experience",
      description: "Create beautiful stories with our intuitive editor, complete with image uploads and formatting options."
    },
    {
      icon: UserGroupIcon,
      title: "Vibrant Community",
      description: "Connect with passionate writers and readers from around the world. Share ideas and get inspired."
    },
    {
      icon: HeartIcon,
      title: "Reader Engagement",
      description: "Build meaningful connections with your audience through likes, comments, and shares."
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure & Reliable",
      description: "Your stories are safe with us. Enterprise-grade security protects your content and data."
    },
    {
      icon: GlobeAltIcon,
      title: "Global Reach",
      description: "Publish your stories to readers worldwide. No geographic limits on your creativity."
    },
    {
      icon: LightBulbIcon,
      title: "Creative Freedom",
      description: "Express yourself without limits. Write about anything that inspires you."
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Writers" },
    { number: "50K+", label: "Published Stories" },
    { number: "1M+", label: "Monthly Readers" },
    { number: "150+", label: "Countries Reached" }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400",
      bio: "Former journalist turned tech entrepreneur, passionate about democratizing storytelling."
    },
    {
      name: "Marcus Johnson",
      role: "Head of Product",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      bio: "UX expert with 10+ years designing platforms that writers love to use."
    },
    {
      name: "Elena Rodriguez",
      role: "Community Lead",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      bio: "Building bridges between writers and readers, fostering our global community."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce-in">
            <SparklesIcon className="w-4 h-4" />
            <span>About Blogify</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Where Stories
            </span>
            <br />
            <span className="text-gray-900">Come to Life</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Blogify is more than just a blogging platform. We're a community of storytellers, dreamers, and thinkers who believe that every voice matters and every story deserves to be heard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <Link
              to="/register"
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-primary-500/25 transition-all transform hover:-translate-y-1"
            >
              Start Your Journey
            </Link>
            <Link
              to="/"
              className="border-2 border-primary-500 text-primary-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-50 transition-all"
            >
              Explore Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              To create a world where anyone can share their story, connect with others, and make their voice heard across the globe.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="bg-gradient-to-r from-primary-500 to-blue-500 p-8 rounded-3xl text-white">
                <RocketLaunchIcon className="w-16 h-16 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Empowering Creators</h3>
                <p className="text-lg leading-relaxed">
                  We believe that everyone has a unique perspective worth sharing. Our platform provides the tools and audience you need to turn your thoughts into impactful stories.
                </p>
              </div>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-3xl text-white">
                <HeartIcon className="w-16 h-16 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Building Community</h3>
                <p className="text-lg leading-relaxed">
                  Great stories create connections. We're fostering a global community where writers and readers can engage, learn from each other, and grow together.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Growing Together</h2>
            <p className="text-xl text-gray-600">Join thousands of creators in our thriving community</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Blogify?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built everything you need to create, share, and grow your audience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate individuals dedicated to empowering storytellers worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div 
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all p-8 text-center animate-fade-in"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-6 ring-4 ring-primary-100"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-primary-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 via-primary-700 to-blue-600">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Our Story</h2>
          <div className="text-lg text-primary-100 leading-relaxed space-y-6">
            <p>
              Blogify was born from a simple idea: everyone has a story worth telling. In 2024, our founder Sarah Chen, 
              a former journalist, noticed how difficult it was for emerging writers to find their voice and audience online.
            </p>
            <p>
              Traditional platforms were either too complex for beginners or too limiting for serious writers. 
              We set out to create something different - a platform that grows with you, from your first post to your thousandth reader.
            </p>
            <p>
              Today, Blogify is home to thousands of writers from over 150 countries, sharing everything from personal experiences 
              to professional insights, creative fiction to technical tutorials. Every story matters, and every voice deserves to be heard.
            </p>
          </div>
          
          <div className="mt-12">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 inline-flex items-center space-x-2"
            >
              <span>Become Part of Our Story</span>
              <BookOpenIcon className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Questions?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have feedback, need help, or just want to say hello.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@blogify.com"
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Get in Touch
            </a>
            <Link
              to="/"
              className="border-2 border-primary-500 text-primary-600 px-8 py-4 rounded-full font-semibold hover:bg-primary-50 transition-all"
            >
              Read Stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

