import React, { useState, useEffect } from 'react';
import './HeroQuotes.css';

const HeroQuotes = () => {
    const quotes = [
        "I can't afford a full-time designer.",
        "I wish I could scale my look.",
        "Freelancers take too long sometimes."
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [showFinal, setShowFinal] = useState(false);

    useEffect(() => {
        if (currentIndex >= quotes.length) {
            setShowFinal(true);
            return;
        }

        // Show quote with fade in
        setIsVisible(true);

        // Start fade out after 2 seconds
        const fadeOutTimer = setTimeout(() => {
            setIsVisible(false);
        }, 2000);

        // Move to next quote after fade out
        const nextQuoteTimer = setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, 2500);

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(nextQuoteTimer);
        };
    }, [currentIndex]);

    if (showFinal) {
        return (
            <div className="hero-quotes final-message">
                <h2 className="fade-in">Create fast, brand-aligned visuals.</h2>
                <p className="fade-in">Personalized AI built with artists. Built for you.</p>
            </div>
        );
    }

    return (
        <div className="hero-quotes">
            <div className={`quote-bubble ${isVisible ? 'visible' : ''}`}>
                <p className="quote">"{quotes[currentIndex]}"</p>
            </div>
        </div>
    );
};

export default HeroQuotes; 