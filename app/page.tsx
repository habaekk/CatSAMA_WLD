'use client';

import ChatWindow from './components/Chat/ChatWindow';
import HomeAssistantOverlayCards from './components/HA_Dashboard/HomeAssistantOverlayCards';

const VTUBER_URL = process.env.NEXT_PUBLIC_VTUBER_URL ?? 'http://127.0.0.1:12393/';
const OVERLAY_CARDS = [
  {
    entityId: 'fan.zhimi_airpurifier_mb4',
    title: 'Air Flow',
    accent: '#19e2cf',
    x: 24,
    y: 24,
  },
  {
    entityId: 'weather.forecast_home',
    title: 'Weather',
    accent: '#5fb0ff',
    x: 1020,
    y: 24,
  },
  {
    entityId: 'climate.living_room',
    title: 'Living Climate',
    accent: '#c788ff',
    x: 24,
    y: 560,
  },
  {
    entityId: 'switch.coffee_machine',
    title: 'Coffee',
    accent: '#8ef58a',
    x: 1020,
    y: 560,
  },
  {
    entityId: 'sensor.outdoor_temperature',
    title: 'Outdoor Temp',
    accent: '#ff7a59',
    x: 522,
    y: 24,
  },
];

export default function Home() {
  return (
    <div className="grid gap-0 lg:h-[calc(100vh-64px)] lg:grid-cols-[1.35fr_0.65fr] lg:overflow-hidden">
      <section className="p-4 md:p-6 lg:h-full">
        <div className="relative aspect-video overflow-hidden border border-white/10 bg-[rgba(0,0,0,0.78)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(25,226,207,0.08),transparent_34%)]" />

          <div className="absolute inset-0 z-10 overflow-hidden bg-black">
            <iframe
              src={VTUBER_URL}
              title="Open LLM VTuber"
              className="h-full w-full"
              allow="microphone; camera"
            />
          </div>

          <HomeAssistantOverlayCards
            cards={OVERLAY_CARDS}
            storageKey="home-overlay-card-positions-v1"
          />
        </div>
      </section>

      <section className="min-w-0 lg:flex lg:h-full lg:overflow-hidden">
        <ChatWindow className="border-l-0 lg:h-full lg:min-h-0 lg:max-h-[calc(100vh-64px)]" />
      </section>
    </div>
  );
}
