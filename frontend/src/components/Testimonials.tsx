// frontend/src/components/Testimonials.tsx
import React, { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
  occasion?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Delhi",
    rating: 5,
    comment: "Absolutely divine sweets! The Gulab Jamun reminded me of my grandmother's cooking. The quality is exceptional and delivery was super fast. Will definitely order again for Diwali!",
    avatar: "👩‍💼",
    occasion: "Diwali Celebration"
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    location: "Mumbai",
    rating: 5,
    comment: "Best Kaju Katli I've ever tasted! Ordered a 5kg box for my daughter's wedding and guests couldn't stop praising the quality. Mithai Palace is now our go-to for all celebrations.",
    avatar: "👨‍🏫",
    occasion: "Wedding"
  },
  {
    id: 3,
    name: "Anita Desai",
    location: "Bangalore",
    rating: 5,
    comment: "The packaging was beautiful and the sweets were incredibly fresh. My family loved the variety box. The Rasgulla was perfectly soft and the Barfi had the right amount of sweetness.",
    avatar: "👩‍⚕️",
    occasion: "Birthday Party"
  },
  {
    id: 4,
    name: "Vikram Singh",
    location: "Pune",
    rating: 5,
    comment: "Outstanding service! Needed sweets for a corporate event at short notice. They delivered exactly on time with beautiful presentation. Our clients were very impressed!",
    avatar: "👨‍💼",
    occasion: "Corporate Event"
  },
  {
    id: 5,
    name: "Meera Patel",
    location: "Ahmedabad",
    rating: 5,
    comment: "Traditional taste with modern convenience! The online ordering process was smooth and the sweets arrived perfectly fresh. My kids especially loved the Ladoo varieties.",
    avatar: "👩‍🍳",
    occasion: "Festival"
  },
  {
    id: 6,
    name: "Arjun Reddy",
    location: "Hyderabad",
    rating: 5,
    comment: "Exceptional quality and authentic flavors! Been ordering from Mithai Palace for 2 years now. They never disappoint. The Malai Roll is absolutely heavenly!",
    avatar: "👨‍🔬",
    occasion: "Regular Customer"
  }
];

interface TestimonialsProps {
  isSignedIn?: boolean;
  onSignIn?: () => void;
}

export const Testimonials: React.FC<TestimonialsProps> = ({ isSignedIn = false, onSignIn }) => {
  const scrollToSweetsSection = () => {
    const sweetsSection = document.getElementById('complete-collection');
    if (sweetsSection) {
      sweetsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderNow = () => {
    if (!isSignedIn) {
      onSignIn?.();
    } else {
      scrollToSweetsSection();
    }
  };
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  return (
    <>
      <style>{`
        @keyframes float-testimonial {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }
        
        @keyframes slide-in-testimonial {
          0% { transform: translateX(100px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes star-twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
        
        .animate-float-testimonial { animation: float-testimonial 6s ease-in-out infinite; }
        .animate-slide-in-testimonial { animation: slide-in-testimonial 0.6s ease-out; }
        .animate-star-twinkle { animation: star-twinkle 1.5s ease-in-out infinite; }
      `}</style>

      <section className="mb-16">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4 border border-white/20">
            <span className="text-2xl">💝</span>
            <span className="text-white font-semibold">Customer Love</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Don't just take our word for it - hear from our delighted customers across India
          </p>
        </div>

        {/* Main Testimonial Display */}
        <div className="relative max-w-4xl mx-auto">
          <div 
            className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl animate-float-testimonial border border-white/10"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 border border-white/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 border border-white/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Testimonial Content */}
            <div key={currentTestimonial} className="text-center animate-slide-in-testimonial">
              {/* Quote Icon */}
              <div className="text-6xl text-brand-orange/50 mb-6">❝</div>
              
              {/* Rating Stars */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className="text-3xl text-yellow-400 animate-star-twinkle"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-xl md:text-2xl text-gray-200 font-medium leading-relaxed mb-8 max-w-3xl mx-auto">
                "{testimonials[currentTestimonial].comment}"
              </blockquote>

              {/* Customer Info */}
              <div className="flex items-center justify-center gap-6">
                <div className="text-6xl">{testimonials[currentTestimonial].avatar}</div>
                <div className="text-left">
                  <div className="text-xl font-bold text-white">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-gray-300 mb-1">
                    📍 {testimonials[currentTestimonial].location}
                  </div>
                  {testimonials[currentTestimonial].occasion && (
                    <div className="bg-gradient-to-r from-brand-orange/30 to-yellow-400/30 rounded-full px-3 py-1 text-sm font-medium text-brand-orange border border-brand-orange/20">
                      🎉 {testimonials[currentTestimonial].occasion}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Indicators */}
          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentTestimonial === index 
                    ? 'bg-brand-orange scale-125 shadow-lg' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Customer Stats Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20">
            <div className="text-3xl font-bold text-brand-orange mb-2">10,000+</div>
            <div className="text-gray-300 text-sm font-medium">Happy Customers</div>
          </div>
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20">
            <div className="text-3xl font-bold text-brand-orange mb-2">4.9⭐</div>
            <div className="text-gray-300 text-sm font-medium">Average Rating</div>
          </div>
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20">
            <div className="text-3xl font-bold text-brand-orange mb-2">50,000+</div>
            <div className="text-gray-300 text-sm font-medium">Orders Delivered</div>
          </div>
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20">
            <div className="text-3xl font-bold text-brand-orange mb-2">98%</div>
            <div className="text-gray-300 text-sm font-medium">Repeat Customers</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/10 hover:border-white/20 transition-all duration-300">
            <div className="text-4xl">🎊</div>
            <div className="text-center sm:text-left">
              <div className="text-xl font-bold text-white mb-1">
                Join thousands of satisfied customers!
              </div>
              <div className="text-gray-300 text-sm">
                Experience the Mithai Palace difference today
              </div>
            </div>
            <button 
              onClick={handleOrderNow}
              className="bg-gradient-to-r from-brand-orange to-yellow-500 hover:from-yellow-500 hover:to-brand-orange text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Order Now 🛒
            </button>
          </div>
        </div>
      </section>
    </>
  );
};