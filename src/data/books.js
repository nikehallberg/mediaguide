// Helper to dynamically import book images
const bookImage = (num, ext = 'jpg') => {
    // Some images have different extensions
    const extMap = {
        // Add book numbers with special extensions here, e.g. 11: 'png', 12: 'jpeg'
    };
    const realExt = extMap[num] || ext;
    return new URL(`../assets/book${num}.${realExt}`, import.meta.url).href;
};

export const books = [
    {
        title: 'Coraline',
        image: bookImage(1),
        genre:'Fantasy, Horror',
        about: 'Coraline is bored and disappointed with her parents. One day she finds a secret door and on the other side he discovers a better version of his life! But the new world turns out to be not so perfect.',
        review: 5,
        dateAdded: "2025-09-01"
    },
    {
        title: 'The Shining',
        image: bookImage(2),
        genre: 'Horror, Mystery',
        about: "Writer Jack takes his son Danny and wife Wendy to work at a remote hotel. However, Jack suffers from writer's block and the longer the family is at the hotel, the more he breaks down.",
        review: 4.5,
        dateAdded: "2025-09-01"
    },
    {
        title: 'You',
        image: bookImage(3),
        genre: 'Thriller, Romance',
        about: 'A charming and seemingly normal bookstore manager becomes obsessed with his girlfriends and often resorts to extreme measures to control their lives and eliminate any threat to the relationship.',
        review: 3,
        dateAdded: "2025-09-01"
    },
    {
        title: 'It',
        image: bookImage(4),
        genre: 'Horror, Thriller, Fantasy',
        about: 'When children mysteriously disappear from the small town of Derry, seven friends begin to investigate, facing their own inner demons in the form of an evil clown named Pennywise.',
        review: 3.5,
        dateAdded: "2025-09-01"
    },
    {
        title: 'One Of Us Is Lying',
        image: bookImage(5),
        genre: 'Young Adult, Mystery',
        about: 'Five students are in detention when one of the students suddenly dies while the teacher is out. After claims that this was no accident, the four remaining students in detention become suspects.',
        review: 3,
        dateAdded: "2025-09-01"
    },
    {
        title: "Harry Potter and the Sorcerer's Stone",
        image: bookImage(6),
        genre: 'Fantasy, Fiction, Young Adult',
        about: "Harry Potter, an orphaned boy with magical talents, begins studies at Hogwarts, a school for wizardry. Harry meets Hermione and Ron and unravels the mystery surrounding his parents' deaths.",
        review: 4,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Harry Potter and the Chamber of Secrets',
        image: bookImage(7),
        genre: 'Fantasy, Fiction, Young Adult',
        about: 'The summer holidays are finally over and the orphaned little boy Harry Potter returns to Hogwarts School of Wizardry, where another year of adventure and witchcraft awaits.',
        review: 4.5,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Harry Potter and the Prisoner of Azkaban',
        image: bookImage(8),
        genre: 'Fantasy, Fiction, Young Adult',
        about: "It's Harry Potter's third year at Hogwarts and he and his friends are confronted by Sirius Black, an escaped prisoner with strong ties to Harry's past.",
        review: 5,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Harry Potter and the Goblet of Fire',
        image: bookImage(9),
        genre: 'Fantasy, Fiction, Young Adult',
        about: "In Harry's fourth year at Hogwarts, the school prepares a match between the three leading schools. But when the Goblet of Fire has chosen three players, it also chooses a fourth: Harry.",
        review: 4,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Harry Potter and the Order of the Phoenix',
        image: bookImage(10),
        genre: 'Fantasy, Fiction, Young Adult',
        about: 'The new Defense Against the Dark Arts teacher has some bureaucratic methods that leave Hogwarts weak against an evil conspiracy. Harry then begins teaching a group of students how to defend themselves.',
        review: 3,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Harry Potter and the Half-Blood Prince',
        image: bookImage(11),
        genre: 'Fantasy, Fiction, Young Adult',
        about: 'Dumbledore does his best to prepare Harry for his final battle against Voldemort, while the Death Eaters wreak havoc in both the Muggle and wizarding worlds -- and a great tragedy is about to occur.',
        review: 4,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Harry Potter and the Deathly Hallows',
        image: bookImage(12),
        genre: 'Fantasy, Fiction, Young Adult',
        about: 'The evil wizard Voldemort has hidden Horcruxes in secret places and managed to make himself immortal. Harry Potter must find and destroy the Horcruxes to make Voldemort mortal again.',
        review: 4,
        dateAdded: "2025-09-01"
    },
    {
        title: 'Harry Potter and the Cursed Child',
        image: bookImage(13),
        genre: 'Fantasy, Fiction, Young Adult',
        about: "Follow a resentful Albus Potter and best friend, Scorpius Malfoy, as they try to prevent Cedric Diggory's death but instead create an alternate timeline where Voldemort triumphs",
        review: 2,
        dateAdded: "2025-09-09"
    },
    {
        title: 'The Hobbit',
        image: bookImage(14),
        genre: 'Fantasy, Adventure',
        about: "Bilbo Baggins, a hobbit, is swept into an epic quest to reclaim the lost Dwarf Kingdom of Erebor from the fearsome dragon Smaug.",
        review: 4.5,
        dateAdded: "2025-09-15"
    },
    {
        title: 'To Kill a Mockingbird',
        image: bookImage(15),
        genre: 'Classic, Fiction',
        about: "Scout Finch grows up in the racially charged Depression-era South, learning about justice and empathy as her father defends a black man falsely accused of a crime.",
        review: 5,
        dateAdded: "2025-09-15"
    },
    {
        title: '1984',
        image: bookImage(16),
        genre: 'Dystopian, Science Fiction',
        about: "In a totalitarian future society, Winston Smith struggles with oppression, surveillance, and the dangers of independent thought.",
        review: 4,
        dateAdded: "2025-09-15"
    },
    {
        title: 'The Great Gatsby',
        image: bookImage(17),
        genre: 'Classic, Fiction, Romance',
        about: "Nick Carraway narrates the story of Jay Gatsby, a mysterious millionaire obsessed with rekindling his love for Daisy Buchanan.",
        review: 4,
        dateAdded: "2025-09-15"
    },
    {
        title: 'The Hunger Games',
        image: bookImage(18),
        genre: 'Dystopian, Young Adult, Adventure',
        about: "Katniss Everdeen volunteers to take her sister's place in a televised fight to the death in a dystopian future.",
        review: 4.5,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Brave New World',
        image: bookImage(19),
        genre: 'Dystopian, Science Fiction, Classic',
        about: "In a futuristic society driven by technology and control, individuality and free will are suppressed for the sake of stability and happiness.",
        review: 4,
        dateAdded: "2025-09-15"
    },
    {
        title: 'Pride and Prejudice',
        image: bookImage(20),
        genre: 'Classic, Romance, Fiction',
        about: "Elizabeth Bennet navigates issues of manners, upbringing, morality, and marriage in the society of early 19th-century England.",
        review: 5,
        dateAdded: "2025-09-15"
    }
];