export interface Person {
    name: string;
    note: string | null;
}

export interface SiteInfo {
    name: string;
    school: string;
    school_si: string;
    founded: string;
    address: string;
    email: string;
    facebook: string;
    contacts: { role: string; name: string; note: string; phone: string; whatsapp: boolean; image: string }[];
}

export interface NewsItem {
    slug: string;
    date: string | null;
    deadline?: string;
    type: 'news' | 'notice' | 'event';
    title: string;
    image: string | null;
    body: string[];
    gallery?: { image: string; caption?: string | null }[];
}

export interface Project {
    slug: string;
    title: string;
    image: string;
    status?: 'planned' | 'ongoing' | 'completed' | null;
    summary?: string | null;
    body?: string[];
    estimate?: string | null;
    gallery?: { image: string; caption?: string | null }[];
}

export interface BankDetails {
    note: string;
    account_number: string;
    account_name: string;
    bank: string;
    branch: string;
}

export interface ContributionRow {
    name: string;
    note: string | null;
    amount: string;
}
