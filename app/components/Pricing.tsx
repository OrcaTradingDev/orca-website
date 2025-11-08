// app/components/Pricing.tsx
"use client";

import React from "react";

export default function Pricing() {
  return (
    <section id="pricing" className="section">
      <div className="container">
        <h2 className="h2">Membership & Pricing</h2>

        {/* Now — Beta */}
        <div className="pricing-beta card">
          <div className="pricing-card-header">
            <h3 className="pricing-title">
              Screener (Free during Beta) <span className="price">€0</span>
            </h3>
          </div>

          <ul className="features">
            <li>Full Screener access</li>
            <li>Community & updates</li>
            <li>Basic alerts</li>
            {/* NEW bullets requested */}
            <li>Watchlists & alerts</li>
            <li>Discord support</li>
          </ul>

          <div className="cta">
            <a href="/signup" className="btn btn-primary">
              Choose plan
            </a>
          </div>
        </div>

        {/* After V1 Launch */}
        <h4 className="pricing-subhead">After V1 Launch</h4>

        <div className="pricing-grid">
          {/* Free */}
          <div className="pricing-card card">
            <div className="pricing-card-header">
              <h3 className="pricing-title">
                Free <span className="price">€0</span>
              </h3>
            </div>
            <ul className="features">
              <li>Complete Screener</li>
              <li>Community access</li>
              <li>Basic alerts</li>
            </ul>
            <div className="cta">
              <a href="/signup" className="btn btn-primary">
                Choose plan
              </a>
            </div>
          </div>

          {/* Premium */}
          <div className="pricing-card card">
            <div className="pricing-card-header">
              <h3 className="pricing-title">
                Premium <span className="price">€8.99</span>
              </h3>
            </div>
            <ul className="features">
              <li>Advanced alerts & watchlists</li>
              <li>Transparency dashboard</li>
              <li>Priority support</li>
            </ul>
            <div className="cta">
              <a href="/signup" className="btn btn-primary">
                Choose plan
              </a>
            </div>
          </div>

          {/* Institutional */}
          <div className="pricing-card card">
            <div className="pricing-card-header">
              <h3 className="pricing-title">
                Institutional <span className="muted">(Future)</span>
              </h3>
            </div>
            <ul className="features">
              <li>Custom dashboards</li>
              <li>Advanced APIs & SLAs</li>
              <li>Dedicated onboarding</li>
            </ul>
            <div className="cta">
              <a href="/contact" className="btn btn-primary">
                Choose plan
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

