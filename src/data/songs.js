// Helper to dynamically import song images
const songImage = (num, ext = 'jpg') => {
    // Some images have different extensions
    const extMap = {
        11: 'png', 14: 'png', 15: 'png', 16: 'png', 20: 'png', 21: 'png'
    };
    const realExt = extMap[num] || ext;
    return new URL(`../assets/song${num}.${realExt}`, import.meta.url).href;
};

export const songs = [
    {
        title: 'Slipping through my fingers - ABBA',
        image: songImage(1),
        genre: 'Pop, Folk Music',
        about: 'From the album "The Visitors"',
        review: 5,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Exploration - Bruno Coulais',
        image: songImage(2),
        genre: 'Classical, Soundtrack',
        about: 'A song from the movie "Coraline"',
        review: 5,
        dateAdded: "2025-09-01"
    },
    {
        title: 'You Rock My World - Michael Jackson',
        image: songImage(4),
        genre: 'R&B, Pop,',
        about: 'From the album "Invincible"',
        review: 5,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Merry-Go-Round of Life - Joe Hisashi',
        image: songImage(5),
        genre: 'Classical, Soundtrack',
        about: 'A song from the movie "Howls Moving Castle"',
        review: 5,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Bohemian Rhapsody - Queen',
        image: songImage(6),
        genre: 'Rock, Indie, Pop ',
        about: 'From the album "A Night at the Opera"',
        review: 5,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Treasure - Bruno Mars',
        image: songImage(7),
        genre: 'Pop, Soul, Disco',
        about: 'From the album "Unorthodox Jukebox"',
        review: 3,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Toxic - Britney Spears',
        image: songImage(8),
        genre: 'Pop, Electro',
        about: 'From the album "In the Zone"',
        review: 3.5,
        dateAdded: "2025-09-01"
    },
    {
        title: 'My Band - D12',
        image: songImage(9),
        genre: 'Rap, Pop',
        about: 'From the album "D12 World"',
        review: 4,
        dateAdded: "2025-09-01"
    },
    {
        title: 'No One Noticed - The Marias',
        image: songImage(10),
        genre: 'Indie, Electro ',
        about: 'From the album "Submarine"',
        review: 5,
        dateAdded: "2025-09-05"
    },
    {
        title: 'Blinding Lights - The Weeknd',
        image: songImage(11),
        genre: 'Synthwave, Pop',
        about: 'From the album "After Hours"',
        review: 5,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Levitating - Dua Lipa',
        image: songImage(12),
        genre: 'Pop, Disco',
        about: 'From the album "Future Nostalgia"',
        review: 4,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Watermelon Sugar - Harry Styles',
        image: songImage(13),
        genre: 'Pop, Rock',
        about: 'From the album "Fine Line"',
        review: 4.5,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Dance Monkey - Tones and I',
        image: songImage(14),
        genre: 'Pop',
        about: 'From the album "The Kids Are Coming"',
        review: 3.5,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Bad Guy - Billie Eilish',
        image: songImage(15),
        genre: 'Pop, Electro',
        about: 'From the album "When We All Fall Asleep, Where Do We Go?"',
        review: 4,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Sunflower - Post Malone & Swae Lee',
        image: songImage(16),
        genre: 'Hip-Hop, Pop',
        about: 'From the album "Hollywood’s Bleeding"',
        review: 4.5,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Shallow - Lady Gaga & Bradley Cooper',
        image: songImage(17),
        genre: 'Pop, Soundtrack',
        about: 'From the movie "A Star Is Born"',
        review: 5,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Old Town Road - Lil Nas X',
        image: songImage(18),
        genre: 'Country, Hip-Hop',
        about: 'From the album "7 EP"',
        review: 3.5,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Don’t Start Now - Dua Lipa',
        image: songImage(19),
        genre: 'Pop, Disco',
        about: 'From the album "Future Nostalgia"',
        review: 4,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Peaches - Justin Bieber',
        image: songImage(20),
        genre: 'R&B, Pop',
        about: 'From the album "Justice"',
        review: 3.5,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Bobinsky - Bruno Coulais',
        image: songImage(21),
        genre: 'Classical, Soundtrack',
        about: 'A song from the movie "Coraline"',
        review: 5,
        dateAdded: "2025-09-01"
    },
];