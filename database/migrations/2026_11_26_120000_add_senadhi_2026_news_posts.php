<?php

use App\Content\ContentSchema;
use App\Content\ContentTypes;
use App\Models\ContentEntry;
use App\Support\SiteContent;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Senadhi Challenge 2026 coverage from the association's Facebook page
 * (17-25 November 2026): four new posts placed right after the Back to School
 * event, and a fuller write-up of that event. Databases with no news yet get
 * all of this from content:import instead. The event is only rewritten if
 * editors have not changed its text, so their work is never overwritten.
 */
return new class extends Migration
{
    private const CONTENT = <<<'JSON'
{
    "event_title": "Back to School: සේනාදි අභියෝගතා Cricket Tournament & After Party",
    "event_old_body": [
        "Organised by the Past Pupils' Association of Senanayake Central College, Madampe.",
        "තවත් විශේෂාංග රැසක් සමගින් අමතක නොවන අද්දැකීමක් විඳගන්න."
    ],
    "event_new": {
        "body": [
            "සේනානායක පවුල නැවත එකම තැනකට එක් කරන BACK TO SCHOOL – සේනාදි අභියෝගතා 2026 උත්සවය 2026 නොවැම්බර් 28 වන දින ගල්මුරුව, මහගෙදර ගෝල්ඩන් හෙවන් (Mahagedara Golden Heaven) හිදී පැවැත්වේ.",
            "පෙ.ව. 7.30 සිට – සේනාදි අභියෝගතා ක්‍රිකට් තරගාවලිය.",
            "ප.ව. 7.00 සිට – SHAYO RENGE සජීවී සංගීතය සමඟ සේනාදි Musical Night.",
            "ප්‍රවේශ පත්‍රයක මිල රු. 2,000/= කි. පැරණි මිතුරන් සහ ගුරුභවතුන් හමු වීමට, පාසල් මතකයන් අලුත් කර ගැනීමට පමණක් නොව පවුලේ සැමට සහභාගී විය හැකි විනෝදජනක දිනයක් ලෙස මෙය සංවිධානය කර ඇත.",
            "OLD FRIENDS. NEW MEMORIES. ONE FAMILY.",
            "The association's reunion day takes place on 28 November 2026 at Mahagedara Golden Heaven, Galmuruwa: the Senadhi Challenge Cricket Tournament from 7.30 a.m., then the Senadhi Musical Night with live music by Shayo Renge from 7.00 p.m. Tickets are Rs. 2,000, and families are welcome.",
            "Organised by the Past Pupils' Association of Senanayake Central College, Madampe."
        ],
        "gallery": [
            {
                "image": "/images/news/back-to-school-2026-promo.jpg",
                "caption": "Back to School – Senadhi Challenge 2026"
            }
        ]
    },
    "posts": [
        {
            "date": "2026-11-25",
            "type": "notice",
            "deadline": "2026-11-26",
            "title": "සේනාදි අභියෝගතා ක්‍රිකට් තරගාවලිය: කණ්ඩායම් ලියාපදිංචිය නොවැම්බර් 26 දා අවසන්",
            "image": "/images/news/senadhi-2026-team-registration.jpg",
            "body": [
                "සේනාදි අභියෝගතා ක්‍රිකට් තරගාවලිය 2026 සඳහා කණ්ඩායම් ලියාපදිංචි කිරීමේ අවසන් දිනය නොවැම්බර් 26 වේ. නොවැම්බර් 25 වන විට තවත් කණ්ඩායම් 2ක් සඳහා පමණක් අවස්ථාව ඉතිරිව තිබූ බව සංවිධායකයෝ පවසති.",
                "නොවැම්බර් 28 තරගාවලිය පැවැත්වෙන දිනයේදී කිසිදු කණ්ඩායමක් අලුතින් ලියාපදිංචි කරනු නොලැබේ. වැඩි විස්තර සඳහා 070 742 5120 අංකයට WhatsApp හරහා සම්බන්ධ වන්න.",
                "Registration for the Senadhi Challenge Cricket Tournament 2026 closes on 26 November. As of 25 November, only two team slots remained. No teams will be registered on tournament day (28 November). For details, contact 070 742 5120 on WhatsApp."
            ]
        },
        {
            "date": "2026-11-23",
            "type": "news",
            "title": "කුසලානයට වඩා වටිනා දෙය එකමුතුකමයි: සේනාදි අභියෝගතා කුසලානයේ අරුත",
            "image": "/images/news/senadhi-challenge-trophy.jpg",
            "body": [
                "පාසලේ ලාංඡනය සහිත ස්ඵටික නිර්මාණයකින් යුත් සේනාදි අභියෝගතා කුසලානය, ජයග්‍රහණයක සංකේතයකට වඩා එහා ගිය අර්ථයක් දරන බව ආදි ශිෂ්‍ය සංගමය පවසයි. එය ආදි සිසු සිසුවියන්ගේ එකමුතුකමේ, පාසලට ඇති ආදරයේ සහ වසරින් වසර ඔවුන් පාසලට එක් කරන බැඳීමේ සංකේතයකි.",
                "මෙම කුසලානය වාර්ෂිකව තරග වදින බැවින් ජයග්‍රාහකයන් සහ කණ්ඩායම් වෙනස් වනු ඇත; වසරින් වසර නව නම් එහි ඉතිහාසයට එක් වනු ඇත. 2026 දී ආරම්භ වන මෙම ගමන, අනාගතයේදී පාසලේ සියලු ආදි සිසුන් එක් කරන අභිමානවත් සම්ප්‍රදායක් බවට පත් වනු ඇතැයි සංගමය අපේක්ෂා කරයි.",
                "“කුසලානය දිනාගැනීම ජයග්‍රහණයයි. නමුත් අප සියලු දෙනා එකට එක්වීම සැබෑම ජයග්‍රහණයයි!”",
                "The crystal trophy, bearing the college crest, is meant to be more than a prize: the association describes it as a symbol of unity among past pupils and of their bond with the school. It will be contested every year, so winners and teams will change and new names will join its history, but the association hopes the tradition that begins in 2026 will bring generations of past pupils together."
            ]
        },
        {
            "date": "2026-11-22",
            "type": "news",
            "title": "සේනාදි අභියෝගතා කුසලානය රථ පෙළපාලියකින් එළිදැක්වේ",
            "image": "/images/news/senadhi-trophy-parade-1.jpg",
            "body": [
                "මාදම්පේ සේනානායක මධ්‍ය විද්‍යාලයේ ආදි ශිෂ්‍ය සංගමය විසින් හඳුන්වා දුන් සේනාදි අභියෝගතා කුසලානය 2026 නොවැම්බර් 22 වන දින උදෑසන 10.00ට නිල වශයෙන් එළිදක්වන ලදී. ඒ සමඟම සංවිධානය කළ රථ පෙළපාලිය, පාසලේ ආදි සිසු සිසුවියන් විශාල පිරිසකගේ සහභාගීත්වයෙන් ප්‍රදේශය පුරා ගමන් කළේය.",
                "සංගීත රිද්මයෙන් හැඩවුණු රථ පෙළපාලිය, පාසලේ නාමය රැගත් වාහන පෙළ සහ අලුතින් නිර්මාණය කළ කුසලානය ජනතාව අතරට රැගෙන යාම එදින දැකගත හැකි වූ විශේෂ අවස්ථා විය. මෙම උත්සවය සංගමයේ නිල Facebook පිටුව ඔස්සේ සජීවීව විකාශය කෙරිණි.",
                "මෙම අවස්ථාව සාර්ථක කර ගැනීමට සහාය දුන් සියලු ආදි සිසුන්ට, සංවිධායක මණ්ඩලයට සහ සහභාගී වූ සැමට ආදි ශිෂ්‍ය සංගමය සිය ස්තුතිය පළ කරයි. කුසලානය වෙනුවෙන් වන පළමු තරගාවලිය නොවැම්බර් 28 වන දින පැවැත්වේ.",
                "The association officially unveiled the new Senadhi Challenge Trophy at 10.00 a.m. on 22 November 2026. A road parade of past pupils' vehicles, accompanied by music, carried the trophy through the area, and the ceremony was streamed live on the association's Facebook page. The first tournament for the trophy will be played on 28 November."
            ],
            "gallery": [
                {
                    "image": "/images/news/senadhi-trophy-parade-2.jpg"
                },
                {
                    "image": "/images/news/senadhi-trophy-parade-3.jpg"
                },
                {
                    "image": "/images/news/senadhi-trophy-parade-4.jpg"
                },
                {
                    "image": "/images/news/senadhi-trophy-parade-5.jpg"
                }
            ]
        },
        {
            "date": "2026-11-19",
            "type": "news",
            "title": "ආදරණීය ගුරුභවතුන් සිහිපත් කරමින්: Back to School 2026",
            "image": "/images/news/teacher-tribute-renuka.jpg",
            "body": [
                "Back to School 2026 උත්සවයට පෙරාතුව, පාසල් කාලයේ තමන්ට දැනුම පමණක් නොව ජීවිතය ගැනත් කියා දුන් ආදරණීය ගුරුභවතුන් සිහිපත් කරන වීඩියෝ මාලාවක් ආදි ශිෂ්‍ය සංගමය විසින් පළ කරනු ලැබීය. මානෙල් මිස් (නොවැම්බර් 17) සහ රේණුකා ගුරුතුමිය (නොවැම්බර් 19) පිළිබඳ පළ වූ සටහන් ආදි සිසුන්ගේ විශේෂ ප්‍රතිචාරයට ලක් විය.",
                "පන්ති කාමරයේ ගෙවුණු දවස්, ආදරණීය අවවාද සහ සිනහවන් අදටත් තම හදවත් තුළ ජීවමාන බව ආදි සිසුහු ප්‍රතිචාර මඟින් පැවසූහ. නොවැම්බර් 28 උත්සවයේදී ගුරුභවතුන් සමඟ නැවත එම මතකයන් අවදි කර ගැනීමට අවස්ථාව ලැබේ.",
                "In the run-up to the reunion, the association posted video tributes to much-loved teachers, including Manel Miss (17 November) and Renuka Teacher (19 November). Past pupils responded warmly, recalling the lessons, advice and laughter of their school days."
            ],
            "gallery": [
                {
                    "image": "/images/news/teacher-tribute-manel.jpg",
                    "caption": "මානෙල් මිස් / Manel Miss"
                }
            ]
        }
    ]
}
JSON;

    public function up(): void
    {
        if (! ContentEntry::query()->where('type', 'news')->exists()) {
            return;
        }

        $content = json_decode(self::CONTENT, true, flags: JSON_THROW_ON_ERROR);
        $fields = ContentTypes::all()['news']['fields'];

        DB::transaction(function () use ($content, $fields) {
            $event = $this->post($content['event_title']);
            if ($event && $event->data['body'] === $content['event_old_body']) {
                $event->update(['data' => ContentSchema::clean($fields, $content['event_new'] + $event->data)]);
            }

            $posts = array_values(array_filter($content['posts'], fn ($p) => ! $this->post($p['title'])));
            if ($posts === []) {
                return;
            }

            $after = $event?->position ?? -1;
            ContentEntry::query()->where('type', 'news')->where('position', '>', $after)->increment('position', count($posts));
            foreach ($posts as $i => $post) {
                ContentEntry::query()->create([
                    'type' => 'news',
                    'data' => ContentSchema::clean($fields, $post),
                    'position' => $after + 1 + $i,
                ]);
            }
        });

        SiteContent::flush();
    }

    public function down(): void
    {
        $content = json_decode(self::CONTENT, true, flags: JSON_THROW_ON_ERROR);
        $fields = ContentTypes::all()['news']['fields'];

        DB::transaction(function () use ($content, $fields) {
            foreach ($content['posts'] as $post) {
                $entry = $this->post($post['title']);
                if ($entry) {
                    ContentEntry::query()->where('type', 'news')->where('position', '>', $entry->position)->decrement('position');
                    $entry->delete();
                }
            }

            $event = $this->post($content['event_title']);
            if ($event && $event->data['body'] === $content['event_new']['body']) {
                $data = array_diff_key($event->data, ['gallery' => true]);
                $event->update(['data' => ContentSchema::clean($fields, ['body' => $content['event_old_body']] + $data)]);
            }
        });

        SiteContent::flush();
    }

    private function post(string $title): ?ContentEntry
    {
        return ContentEntry::query()->where('type', 'news')->get()->first(fn (ContentEntry $e) => ($e->data['title'] ?? null) === $title);
    }
};
