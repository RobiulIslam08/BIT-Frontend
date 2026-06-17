// ============================================
// BIT SOFTWARE — Clients/Partners Trust Band
// ============================================

import { motion } from 'motion/react';
import { Building2, Award, Shield, BadgeCheck, Crown, Star } from 'lucide-react';
import './Home.css';

const CLIENTS = [
  { name: 'Saudi Aramco', icon: Crown },
  { name: 'SABIC Group', icon: Building2 },
  { name: 'Al Rajhi Bank', icon: Shield },
  { name: 'Nadec Foods', icon: Star },
  { name: 'STC Telecom', icon: BadgeCheck },
  { name: 'Naqel Express', icon: Award },
  { name: 'NEOM City', icon: Building2 },
  { name: 'Al-Safi Dairy', icon: Star },
];

export default function ClientsSection() {
  return (
    <section className="clients section-sm">
      <div className="container">
        <div className="clients__inner">
          <div className="clients__header">
            <p className="clients__label">Trusted By Industry Leaders Across Saudi Arabia</p>
          </div>
          <div className="clients__grid">
            {CLIENTS.map((client, i) => {
              const Icon = client.icon;
              return (
                <motion.div
                  key={client.name}
                  className="clients__item"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Icon size={20} className="clients__item-icon" />
                  <span className="clients__item-name">{client.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
