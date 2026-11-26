import BatchConnect from '@/components/public/home/batch-connect';
import EventsSection from '@/components/public/home/events-section';
import Hero, { type HeroContent } from '@/components/public/home/hero';
import ImpactStrip, { type Giving } from '@/components/public/home/impact-strip';
import LeadershipMessage from '@/components/public/home/leadership-message';
import NewsSection from '@/components/public/home/news-section';
import ProjectsSection from '@/components/public/home/projects-section';
import PublicLayout from '@/layouts/public-layout';
import { type NewsItem, type Project } from '@/types/public';

interface HomeContent {
    hero: HeroContent;
    anniversary: { title: string; from: string; to: string };
    stats: { label: string; value: number }[];
    join: { title: string; text: string };
}

interface Props {
    home: HomeContent;
    message: { text: string; name: string; role: string; image?: string | null };
    /** Upcoming events, soonest first. */
    events: NewsItem[];
    /** News and notices, newest first (at most 3). */
    news: NewsItem[];
    projects: Project[];
    giving: Giving;
    batches: { from: number; to: number } | null;
}

export default function Home({ home, message, events, news, projects, giving, batches }: Props) {
    return (
        <PublicLayout title="Home">
            <div className="text-[17px]">
                <Hero hero={home.hero} anniversary={home.anniversary} nextEvent={events[0]} />
                <ImpactStrip stats={home.stats} join={home.join} giving={giving} batches={batches} />
                <LeadershipMessage message={message} />
                <EventsSection events={events} />
                <ProjectsSection projects={projects} giving={giving} />
                <NewsSection items={news} />
                <BatchConnect />
            </div>
        </PublicLayout>
    );
}
